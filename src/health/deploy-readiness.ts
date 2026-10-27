/**
 * Deploy readiness (state: engine-generated).
 *
 * `runPreflight` validates the *quality* of the settings that exist. This module answers a different
 * question — "is every setting a production deployment cannot work without actually present?" — and is
 * what `pnpm deploy:readiness` runs before a release. Values are never included in the report.
 * It does not verify network reachability of the dependencies: that is the job of readyz / smoke.
 */
import { runPreflight, weakSecretReason, type PreflightFinding } from './preflight';

type Env = Readonly<Record<string, string | undefined>>;

export interface DeployReadinessReport {
  readonly status: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  readonly findings: readonly PreflightFinding[];
}

const has = (env: Env, name: string): boolean => (env[name]?.trim() ?? '') !== '';

const PROVIDER_VARS = [
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
  'HF_TOKEN',
  'GEMINI_API_KEY',
  'AI_GATEWAY_API_KEY',
  'VERCEL_OIDC_TOKEN',
  'OLLAMA_BASE_URL',
] as const;

export function runDeployReadiness(env: Env): DeployReadinessReport {
  const findings: PreflightFinding[] = [...runPreflight({ ...env, NODE_ENV: 'production' }).findings];
  const add = (id: string, severity: 'ERROR' | 'WARN', message: string): void => {
    findings.push({ id, severity, message });
  };

  // Durable evidence: BookPI needs a Postgres database AND an integrity secret, or it stays volatile.
  const secret = env.BOOKPI_INTEGRITY_SECRET?.trim();
  if (secret === undefined || secret === '') {
    add('DR-BOOKPI-SECRET-MISSING', 'ERROR', 'BOOKPI_INTEGRITY_SECRET is not set: the ledger cannot be sealed or verified.');
  } else {
    const weak = weakSecretReason(secret);
    if (weak !== null) add('DR-BOOKPI-SECRET-WEAK', 'ERROR', `BOOKPI_INTEGRITY_SECRET is weak (${weak}).`);
  }

  const dbUrl = env.DATABASE_URL?.trim() || env.POSTGRES_URL?.trim() || env.POSTGRES_URL_NON_POOLING?.trim();
  if (!dbUrl) {
    add('DR-DATABASE-MISSING', 'ERROR', 'No DATABASE_URL / POSTGRES_URL: BookPI and subscriptions would be volatile.');
  } else if (!/^postgres(?:ql)?:\/\//i.test(dbUrl)) {
    add('DR-DATABASE-INVALID', 'ERROR', 'The database URL must start with postgres:// or postgresql://.');
  } else if (!/[?&](?:sslmode=(?:require|verify-ca|verify-full)|ssl=true)/i.test(dbUrl) && !/@(?:postgres|localhost|127\.0\.0\.1)[:/]/.test(dbUrl)) {
    add('DR-DATABASE-TLS', 'WARN', 'The database URL does not request TLS (sslmode=require) for a non-local host.');
  }

  // Atlas / IKES: both halves or neither.
  const sbUrl = has(env, 'SUPABASE_URL');
  const sbKey = has(env, 'SUPABASE_SERVICE_ROLE_KEY');
  if (sbUrl !== sbKey) add('DR-SUPABASE-PARTIAL', 'ERROR', 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set together.');
  else if (!sbUrl) add('DR-SUPABASE-ABSENT', 'WARN', 'Supabase is not configured: Atlas/IKES probes keep /api/v1/readyz degraded.');

  // Generative inference: without a provider the chat answers from the local deterministic engine only.
  if (!PROVIDER_VARS.some((n) => has(env, n)) && !has(env, 'ISABELLA_KEYLESS_FREE_PROVIDER')) {
    add('DR-NO-INFERENCE-PROVIDER', 'WARN', 'No inference provider is configured: replies come from the local fallback, not a model.');
  }

  // Origins: the image default is a localhost placeholder.
  const origins = env.ALLOWED_ORIGINS?.trim() ?? '';
  if (origins === '' || /localhost|127\.0\.0\.1/.test(origins)) {
    add('DR-ORIGINS-LOCAL', 'WARN', 'ALLOWED_ORIGINS is empty or points at localhost.');
  }

  // Serverless with process-local stores loses state on every cold start.
  if (has(env, 'VERCEL') || has(env, 'VERCEL_ENV')) {
    if ((env.ISABELLA_API_KEY_STORE ?? 'memory') === 'memory') {
      add('DR-SERVERLESS-MEMORY-KEYS', 'WARN', 'API keys are stored in memory on serverless: they are lost on cold start.');
    }
  }

  const status = findings.some((f) => f.severity === 'ERROR')
    ? 'BLOCKED'
    : findings.length > 0
      ? 'READY_WITH_WARNINGS'
      : 'READY';
  return { status, findings };
}
