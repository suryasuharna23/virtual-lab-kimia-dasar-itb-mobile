import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { HapticTab } from '@/components/haptic-tab';
import { Platform } from 'react-native';
import { shadows } from '@/constants/theme';

export default function AdminTabLayout() {
  const { theme } = useTheme();
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
          marginBottom: Platform.OS === 'ios' ? 24 : 16,
          position: 'absolute',
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
        headerShown: false, // Hide navigation header for all admin pages
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="module"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ellipsis-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
