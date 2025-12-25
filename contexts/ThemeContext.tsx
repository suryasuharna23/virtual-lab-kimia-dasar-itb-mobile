import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated'
import { lightTheme, darkTheme, type Theme } from '@/constants/theme'
import type { ThemeMode } from '@/types'

interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => Promise<void>
  toggleTheme: () => void
  animatedBackground: ReturnType<typeof useSharedValue<string>>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'theme_mode'
const ANIMATION_DURATION = 300

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [isLoaded, setIsLoaded] = useState(false)

  const getIsDark = (m: ThemeMode) => {
    if (m === 'system') return systemScheme === 'dark'
    return m === 'dark'
  }

  const getInitialBackground = () => {
    const dark = getIsDark(mode)
    return dark ? darkTheme.background : lightTheme.background
  }

  const animatedBackground = useSharedValue(getInitialBackground())

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then(saved => {
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          const savedMode = saved as ThemeMode
          setModeState(savedMode)
          const dark = getIsDark(savedMode)
          animatedBackground.value = dark ? darkTheme.background : lightTheme.background
        }
      })
      .finally(() => setIsLoaded(true))
  }, [])

  const isDark = useMemo(() => getIsDark(mode), [mode, systemScheme])

  const theme = isDark ? darkTheme : lightTheme

  const setMode = useCallback(async (newMode: ThemeMode) => {
    const newIsDark = newMode === 'system' ? systemScheme === 'dark' : newMode === 'dark'
    const newBackground = newIsDark ? darkTheme.background : lightTheme.background

    animatedBackground.value = withTiming(newBackground, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.quad),
    })

    setModeState(newMode)
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode)
  }, [systemScheme, animatedBackground])

  const toggleTheme = useCallback(() => {
    setMode(isDark ? 'light' : 'dark')
  }, [isDark, setMode])

  const value = useMemo(
    () => ({ theme, mode, isDark, setMode, toggleTheme, animatedBackground }),
    [theme, mode, isDark, setMode, toggleTheme, animatedBackground]
  )

  if (!isLoaded) return null

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
