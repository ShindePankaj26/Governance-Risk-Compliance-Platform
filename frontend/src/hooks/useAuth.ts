import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  role: string | null
  fullName: string | null
  isAuthenticated: boolean
  login: (token: string, role: string, fullName: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      fullName: null,
      isAuthenticated: false,
      login: (token, role, fullName) => {
        localStorage.setItem('grc_token', token)
        set({ token, role, fullName, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('grc_token')
        set({ token: null, role: null, fullName: null, isAuthenticated: false })
      },
    }),
    { name: 'grc-auth' }
  )
)
