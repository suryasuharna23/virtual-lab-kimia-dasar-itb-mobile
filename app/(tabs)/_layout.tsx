import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const homeAccent = '#0d9488';
  const homeAccentIdle = '#14b8a6';
  const baseText = 'rgba(15, 23, 42, 0.65)';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: homeAccent,
        tabBarInactiveTintColor: baseText,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen
        name="practicum"
        options={{
          title: 'Practicum',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="books.vertical" color={color} />,
        }}
      />
      <Tabs.Screen
        name="virtual-lab"
        options={{
          title: 'Virtual Lab',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="flask" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerBadge, { backgroundColor: focused ? homeAccent : homeAccentIdle }]}> 
              <IconSymbol size={24} name="house.fill" color={focused ? '#ffffff' : '#0f172a'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Announcements',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="megaphone.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about-lab"
        options={{
          title: 'About Lab',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="info.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
    backgroundColor: '#f8fafc',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 6,
  },
  tabLabel: {
    fontWeight: '700',
  },
  centerBadge: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 7,
  },
});
