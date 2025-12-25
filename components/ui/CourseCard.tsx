import React from 'react'
import { View, ViewStyle, TouchableOpacity } from 'react-native'
import { Text } from './Text'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, borderRadius, colors, shadows } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

interface CourseCardProps {
  title: string
  iconName: keyof typeof Ionicons.glyphMap
  iconColor?: string
  iconBgColor?: string
  onPress?: () => void
  style?: ViewStyle
}

export function CourseCard({
  title,
  iconName,
  iconColor,
  iconBgColor,
  onPress,
  style,
}: CourseCardProps) {
  const { theme } = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: borderRadius['2xl'],
          padding: spacing.md,
          width: 200,
          height: 76,
          marginRight: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          ...shadows.sm
        },
        {
            shadowColor: theme.textPrimary,
            shadowOpacity: 0.05,
        },
        style
      ]}
    >
      <View style={{ 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        backgroundColor: iconBgColor || theme.primarySoft,
        alignItems: 'center', 
        justifyContent: 'center',
        marginRight: spacing.md
      }}>
        <Ionicons name={iconName} size={22} color={iconColor || theme.primary} />
      </View>

      <Text variant="body" weight="bold" style={{ flex: 1 }} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}
