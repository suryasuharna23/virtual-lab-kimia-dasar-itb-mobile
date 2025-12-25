import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'
import 'react-native-reanimated'

import { SplashOverlay } from '@/components/splash-overlay'
import { ThemeProvider, AuthProvider, AppProvider, useTheme } from '@/contexts'

export const unstable_settings = {
  anchor: '(tabs)',
}

function RootLayoutContent() {
  const [showSplash, setShowSplash] = useState(true)
  const { isDark } = useTheme()

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pengumuman/[id]" options={{ title: 'Pengumuman' }} />
        <Stack.Screen name="about" options={{ title: 'Tentang' }} />
        <Stack.Screen name="faq" options={{ title: 'FAQ' }} />
        <Stack.Screen name="kontak" options={{ title: 'Kontak' }} />
        <Stack.Screen name="search" options={{ title: 'Pencarian' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
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
