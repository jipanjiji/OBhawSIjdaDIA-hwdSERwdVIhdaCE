/**
 * Admin Auth Middleware
 * 
 * Protects all /api/admin/* routes (except /api/admin/login).
 * Validates the JWT Bearer token from the Authorization header.
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only intercept /api/admin/* routes, but skip login
  if (!pathname.startsWith('/api/admin') || pathname === '/api/admin/login') {
    return
  }

  // Extract Bearer token
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid Authorization header',
    })
  }

  const token = authHeader.slice(7) // Remove "Bearer "
  const payload = verifyToken(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }

  // Attach user info to the event context for downstream handlers
  event.context.auth = payload
})
