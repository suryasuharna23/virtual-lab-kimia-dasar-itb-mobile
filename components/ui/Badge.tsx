import React from 'react'
import { View, ViewStyle } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { borderRadius, colors } from '@/constants/theme'
import { Text } from './Text'

interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  children: React.ReactNode
  style?: ViewStyle
}

export function Badge({
  variant = 'primary',
  size = 'md',
  children,
  style,
}: BadgeProps) {
  const { theme } = useTheme()

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.primarySoft
      case 'accent':
        return theme.accentSoft
      case 'success':
        return colors.successSoft
      case 'warning':
        return colors.warningSoft
      case 'error':
        return colors.errorSoft
      case 'info':
        return colors.infoSoft
      default:
        return theme.primarySoft
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return theme.primary
      case 'accent':
        return colors.accent
      case 'success':
        return colors.success // #10B981
      case 'warning':
        return colors.warning // #F59E0B
      case 'error':
        return colors.error // #EF4444
      case 'info':
        return colors.info // #3B82F6
      default:
        return theme.primary
    }
  }

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: borderRadius.full,
    paddingVertical: size === 'sm' ? 2 : 4,
    paddingHorizontal: size === 'sm' ? 6 : 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        weight="medium"
        style={{ color: getTextColor() }}
      >
        {children}
      </Text>
    </View>
  )
}
