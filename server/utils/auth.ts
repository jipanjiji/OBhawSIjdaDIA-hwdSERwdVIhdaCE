/**
 * JWT Authentication Helpers
 * 
 * Simple JWT sign/verify utilities for admin authentication.
 * Uses the JWT_SECRET from runtime config.
 */
import jwt from 'jsonwebtoken'

interface TokenPayload {
  username: string
  role: string
}

/**
 * Sign a JWT token with 24-hour expiry.
 */
export function signToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' })
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or null if invalid/expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  const config = useRuntimeConfig()
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload
    return decoded
  } catch {
    return null
  }
}
