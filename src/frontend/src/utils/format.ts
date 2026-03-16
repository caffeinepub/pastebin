export function truncatePrincipal(principal: string): string {
  if (principal.length <= 11) return principal;
  return `${principal.slice(0, 8)}...`;
}
