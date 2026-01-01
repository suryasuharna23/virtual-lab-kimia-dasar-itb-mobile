import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { HapticTab } from '@/components/haptic-tab'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { shadows } from '@/constants/theme'

export default function TabLayout() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          borderRadius: 24,
          marginHorizontal: 16,
          marginBottom: bottomInset,
          height: 64,
          paddingBottom: 0,
          paddingTop: 0,
          ...shadows.lg,
          borderBottomWidth: 4,
          borderBottomColor: theme.border,
          borderLeftWidth: 1,
          borderLeftColor: theme.border,
          borderRightWidth: 1,
          borderRightColor: theme.border,
        },
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        tabBarButton: HapticTab,
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="praktikum"
        options={{
          title: 'Praktikum',
          tabBarIcon: ({ color, focused }) => (
             <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'book' : 'book-outline'} size={28} color={color} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="virtual-lab"
        options={{
          title: 'Lab Virtual',
          tabBarIcon: ({ color, focused }) => (
             <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'flask' : 'flask-outline'} size={28} color={color} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pengumuman"
        options={{
          title: 'Pengumuman',
          tabBarIcon: ({ color, focused }) => (
             <View style={{ alignItems: 'center' }}>
              <Ionicons name={focused ? 'megaphone' : 'megaphone-outline'} size={28} color={color} />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Lainnya',
          tabBarIcon: ({ color, focused }) => (
             <View style={{ alignItems: 'center' }}>
              <Ionicons
                name={focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline'}
                size={28}
                color={color}
              />
              {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4 }} />}
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
