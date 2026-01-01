import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as SecureStore from 'expo-secure-store'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import type { User, Student, LoginRequest, LoginResponse, StudentRegisterRequest } from '@/types'

type AuthUser = User | Student | null

interface AuthContextType {
  user: AuthUser
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isStudent: boolean
  login: (credentials: LoginRequest, isStudentLogin?: boolean) => Promise<void>
  register: (data: StudentRegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null
  const isAdmin = user !== null && 'role' in user && user.role === 'admin'
  const isStudent = user !== null && !('role' in user)

  // Tambahkan forceAdmin agar bisa paksa refresh sebagai admin
  const refreshUser = useCallback(async (forceAdmin: boolean = false) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      if (forceAdmin) {
        // Paksa cek endpoint admin saja
        try {
          const response = await api.get<{ user: User } | User>(endpoints.auth.me)
          if (response.success && response.data) {
            const userData = 'user' in response.data ? response.data.user : response.data
            setUser(userData)
            return
          }
        } catch {
          await api.clearAuthToken()
          setUser(null)
        }
        setIsLoading(false)
        return
      }

      // Default: coba student dulu, lalu admin
      try {
        const response = await api.get<{ user: Student } | Student>(endpoints.auth.studentMe)
        if (response.success && response.data) {
          const userData = 'user' in response.data ? response.data.user : response.data
          setUser(userData)
          return
        }
      } catch {
        // Not student, try admin
      }

      try {
        const response = await api.get<{ user: User } | User>(endpoints.auth.me)
        if (response.success && response.data) {
          const userData = 'user' in response.data ? response.data.user : response.data
          setUser(userData)
          return
        }
      } catch {
        await api.clearAuthToken()
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (credentials: LoginRequest, isStudentLogin = false) => {
      const endpoint = isStudentLogin ? endpoints.auth.studentLogin : endpoints.auth.login
      const response = await api.post<LoginResponse>(endpoint, credentials)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed')
      }

      await api.setAuthToken(response.data.token)
      // Setelah login admin, set user langsung dari respons
      if (!isStudentLogin) {
        setUser(response.data.user)
      } else {
        setUser(response.data.user)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    await api.clearAuthToken()
    setUser(null)
  }, [])

  const register = useCallback(async (data: StudentRegisterRequest) => {
    const response = await api.post<LoginResponse>(endpoints.auth.studentRegister, data)

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed')
    }

    await api.setAuthToken(response.data.token)
    setUser(response.data.user)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      isAdmin,
      isStudent,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, isAuthenticated, isAdmin, isStudent, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
