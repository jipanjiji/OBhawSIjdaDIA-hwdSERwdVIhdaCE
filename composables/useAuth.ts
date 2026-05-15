/**
 * useAuth Composable
 * 
 * Manages client-side authentication state.
 * Stores JWT token in localStorage and provides reactive auth state.
 */

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

// Use useState for SSR-compatible reactive state
export function useAuth() {
  const token = useState<string | null>('auth-token', () => null)
  const isAuthenticated = computed(() => !!token.value)

  // Initialize from localStorage (client-side only)
  function init() {
    if (import.meta.client) {
      const stored = localStorage.getItem('obsidia-token')
      if (stored) {
        token.value = stored
      }
    }
  }

  // Login — send credentials, store token
  async function login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await $fetch<{ success: boolean; token: string; message: string }>('/api/admin/login', {
        method: 'POST',
        body: { username, password },
      })

      if (response.success && response.token) {
        token.value = response.token
        if (import.meta.client) {
          localStorage.setItem('obsidia-token', response.token)
        }
        return { success: true, message: response.message }
      }

      return { success: false, message: 'Login failed' }
    } catch (error: any) {
      const message = error?.data?.message || error?.message || 'Login failed'
      return { success: false, message }
    }
  }

  // Logout — clear token
  function logout() {
    token.value = null
    if (import.meta.client) {
      localStorage.removeItem('obsidia-token')
    }
    navigateTo('/login')
  }

  // Get Authorization header value
  function getAuthHeader(): Record<string, string> {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  // Authenticated fetch helper
  async function authFetch<T>(url: string, options: any = {}): Promise<T> {
    return $fetch<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        ...getAuthHeader(),
      },
    })
  }

  return {
    token: readonly(token),
    isAuthenticated,
    init,
    login,
    logout,
    getAuthHeader,
    authFetch,
  }
}
