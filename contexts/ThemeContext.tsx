import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { lightTheme, darkTheme, type Theme } from '@/constants/theme'
import type { ThemeMode } from '@/types'

interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => Promise<void>
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'theme_mode'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(saved => {
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setModeState(saved as ThemeMode)
        }
      })
      .finally(() => setIsLoaded(true))
  }, [])

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode)
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode)
  }, [])

  const isDark = useMemo(() => {
    if (mode === 'system') return systemScheme === 'dark'
    return mode === 'dark'
  }, [mode, systemScheme])

  const theme = isDark ? darkTheme : lightTheme

  const toggleTheme = useCallback(() => {
    setMode(isDark ? 'light' : 'dark')
  }, [isDark, setMode])

  const value = useMemo(
    () => ({ theme, mode, isDark, setMode, toggleTheme }),
    [theme, mode, isDark, setMode, toggleTheme]
  )

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) return null

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
