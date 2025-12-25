import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import Toast from 'react-native-toast-message'
import 'react-native-reanimated'

import { SplashOverlay } from '@/components/splash-overlay'
import { ThemeProvider, AuthProvider, AppProvider, useTheme } from '@/contexts'
import { useAuth } from '@/contexts/AuthContext'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = (segments[0] as string) === 'auth'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login' as any)
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any)
    }
  }, [isAuthenticated, isLoading, segments])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <>{children}</>
}

function RootLayoutContent() {
  const [showSplash, setShowSplash] = useState(true)
  const { isDark, theme } = useTheme()

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AuthGuard>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.textPrimary,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="nametag" options={{ headerShown: false }} />
          <Stack.Screen name="pengumuman/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="offline-files" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="faq" options={{ headerShown: false }} />
          <Stack.Screen name="kontak" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ title: 'Pencarian' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack>
      </AuthGuard>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast />
      {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
    </View>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <RootLayoutContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
