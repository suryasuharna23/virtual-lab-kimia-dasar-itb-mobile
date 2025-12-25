import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import Toast from 'react-native-toast-message'
import type { AppNotification } from '@/types'

interface AppContextType {
  showNotification: (notification: AppNotification) => void
  isOnline: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true)
    })

    return () => unsubscribe()
  }, [])

  const showNotification = useCallback((notification: AppNotification) => {
    Toast.show({
      type: notification.type,
      text1: notification.title,
      text2: notification.message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    })
  }, [])

  const value = useMemo(() => ({ showNotification, isOnline }), [showNotification, isOnline])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
