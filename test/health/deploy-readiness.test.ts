import { describe, expect, it } from "vitest";
import { runDeployReadiness } from "../../src/health/deploy-readiness";

const strong = (seed: string): string => Array.from({ length: 48 }, (_, i) => "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(i * 7 + seed.charCodeAt(i % seed.length)) % 62]).join("");

const good = {
  GENESIS_ADMIN_API_TOKEN: strong("admin"),
  OPS_API_TOKEN: strong("ops!!"),
  APP_PUBLIC_URL: "https://isabella.example.org",
  BOOKPI_INTEGRITY_SECRET: strong("bookpi"),
  DATABASE_URL: "postgresql://u:p@db.example.org:5432/isabella?sslmode=require",
  SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: strong("sb"),
  GROQ_API_KEY: "gsk_example",
  ALLOWED_ORIGINS: "https://isabella.example.org",
  BOOKPI_LEDGER_PATH: "/app/data/ledger.jsonl",
} as const;

describe("deploy readiness", () => {
  it("is READY for a complete production configuration", () => {
    const r = runDeployReadiness(good);
    expect(r.findings.filter((f) => f.severity === "ERROR")).toEqual([]);
    expect(r.status).toBe("READY");
  });

  it("blocks without the integrity secret or a database", () => {
    const { BOOKPI_INTEGRITY_SECRET: _s, DATABASE_URL: _d, ...rest } = good;
    const r = runDeployReadiness(rest);
    expect(r.status).toBe("BLOCKED");
    const ids = r.findings.map((f) => f.id);
    expect(ids).toContain("DR-BOOKPI-SECRET-MISSING");
    expect(ids).toContain("DR-DATABASE-MISSING");
  });

  it("rejects a weak integrity secret and a non-postgres URL", () => {
    const r = runDeployReadiness({ ...good, BOOKPI_INTEGRITY_SECRET: "changeme", DATABASE_URL: "mysql://x" });
    const ids = r.findings.map((f) => f.id);
    expect(ids).toContain("DR-BOOKPI-SECRET-WEAK");
    expect(ids).toContain("DR-DATABASE-INVALID");
  });

  it("requires Supabase URL and key together; warns when absent", () => {
    const { SUPABASE_SERVICE_ROLE_KEY: _k, ...half } = good;
    expect(runDeployReadiness(half).findings.map((f) => f.id)).toContain("DR-SUPABASE-PARTIAL");
    const { SUPABASE_URL: _u, SUPABASE_SERVICE_ROLE_KEY: _k2, ...none } = good;
    const r = runDeployReadiness(none);
    expect(r.findings.map((f) => f.id)).toContain("DR-SUPABASE-ABSENT");
    expect(r.status).toBe("READY_WITH_WARNINGS");
  });

  it("warns about a missing inference provider and localhost origins", () => {
    const { GROQ_API_KEY: _g, ...rest } = good;
    const ids = runDeployReadiness({ ...rest, ALLOWED_ORIGINS: "http://localhost:3000" }).findings.map((f) => f.id);
    expect(ids).toContain("DR-NO-INFERENCE-PROVIDER");
    expect(ids).toContain("DR-ORIGINS-LOCAL");
  });

  it("never leaks secret values in findings", () => {
    const r = runDeployReadiness({ ...good, BOOKPI_INTEGRITY_SECRET: "changeme" });
    expect(JSON.stringify(r)).not.toContain("changeme");
  });
});
