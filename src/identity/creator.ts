import type { Principal } from './principal';

/**
 * Recognize the creator only from a server-authenticated human principal.
 * Display names, aliases, chat text and client-supplied claims are not credentials.
 */
export function isAuthenticatedCreatorPrincipal(
  principal: Principal,
  configuredCreatorPrincipalId: string | undefined
): boolean {
  if (principal.kind !== 'human') return false;
  const configuredId = configuredCreatorPrincipalId?.trim();
  return (
    (configuredId !== undefined && configuredId.length > 0 && principal.id === configuredId) ||
    principal.roles.includes('isabella:creator')
  );
}
