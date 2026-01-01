import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import Toast from 'react-native-toast-message'
import 'react-native-reanimated'

import { SplashOverlay } from '@/components/splash-overlay'
import { ThemeProvider, AuthProvider, AppProvider, useTheme } from '@/contexts'
import { useAuth } from '@/contexts/AuthContext'

export const unstable_settings = {
  initialRouteName: 'auth-selection',
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin, isStudent } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = (segments[0] as string) === 'auth'
    const inAuthSelection = (segments[0] as string) === 'auth-selection'
    const inAdmin = (segments[0] as string) === 'admin'
    const inTabs = (segments[0] as string) === '(tabs)'
    
    const allowedStudentRoutes = ['nametag', 'profile', 'offline-files', 'about', 'faq', 'kontak', 'search', 'pdf-viewer', 'pengumuman']
    const isAllowedStudentRoute = allowedStudentRoutes.includes(segments[0] as string)

    if (!isAuthenticated && !inAuthGroup && !inAuthSelection && !inAdmin) {
      router.replace('/auth-selection' as any)
    } else if (isAuthenticated) {
      if (isAdmin && !inAdmin) {
        router.replace('/admin' as any)
      } else if (isStudent && !inTabs && !isAllowedStudentRoute) {
        router.replace('/(tabs)' as any)
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, isStudent, segments])

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
  const { isDark, theme, animatedBackground } = useTheme()

  const animatedContainerStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: animatedBackground.value,
  }))

  return (
    <Animated.View style={animatedContainerStyle}>
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
          <Stack.Screen name="pdf-viewer" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </AuthGuard>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast />
      {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
    </Animated.View>
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
