export function isSignupTokenHash(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{32,128}$/.test(value);
}
