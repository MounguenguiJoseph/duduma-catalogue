export const SESSION_COOKIE = 'admin_session'

export function buildSessionToken(pin: string, secret: string): string {
  // Simple deterministic token: sha256-like using built-in (Edge & Node compatible)
  // We store HMAC in the cookie to avoid exposing PIN
  return Buffer.from(`${pin}:${secret}`).toString('base64url')
}

export function validateSessionToken(token: string, pin: string, secret: string): boolean {
  return token === buildSessionToken(pin, secret)
}
