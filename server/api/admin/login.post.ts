/**
 * POST /api/admin/login
 * 
 * Authenticates admin using username/password from environment variables.
 * Returns a JWT token on success.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username and password are required',
    })
  }

  const config = useRuntimeConfig()

  // Validate credentials against environment variables
  if (username !== config.adminUsername || password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }

  // Generate JWT
  const token = signToken({ username, role: 'admin' })

  return {
    success: true,
    token,
    message: 'Login successful',
  }
})
