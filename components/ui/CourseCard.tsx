import React from 'react'
import { View, ViewStyle, TouchableOpacity } from 'react-native'
import { Text } from './Text'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, borderRadius, colors, shadows } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

interface CourseCardProps {
  title: string
  progress: number // 0 to 1
  iconName: keyof typeof Ionicons.glyphMap
  iconColor?: string
  iconBgColor?: string
  onPress?: () => void
  style?: ViewStyle
}

export function CourseCard({
  title,
  progress,
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
          padding: spacing.lg,
          width: 160,
          marginRight: spacing.md,
          ...shadows.sm // Soft shadow
        },
        // Fallback shadow in case spread doesn't work well or needs override
        {
            shadowColor: theme.textPrimary,
            shadowOpacity: 0.05,
        },
        style
      ]}
    >
      <View style={{ 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        backgroundColor: iconBgColor || theme.primarySoft,
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: spacing.md
      }}>
        <Ionicons name={iconName} size={24} color={iconColor || theme.primary} />
      </View>

      <Text variant="body" weight="bold" style={{ marginBottom: spacing.md }} numberOfLines={2}>
        {title}
      </Text>

      <View style={{ marginBottom: spacing.xs }}>
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text variant="caption" color="secondary">Progress</Text>
            <Text variant="caption" weight="bold">{Math.round(progress * 100)}%</Text>
         </View>
         {/* Simple Progress Bar */}
         <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: iconColor || theme.primary, borderRadius: 3 }} />
         </View>
      </View>
    </TouchableOpacity>
  )
}
