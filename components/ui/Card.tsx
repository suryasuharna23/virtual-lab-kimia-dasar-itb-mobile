import React from 'react'
import { View, ViewStyle, Pressable } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { borderRadius, spacing, shadows } from '@/constants/theme'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  disabled?: boolean
}

export function Card({
  children,
  style,
  onPress,
  disabled = false,
}: CardProps) {
  const { theme } = useTheme()
  const pressed = useSharedValue(0)

  const handlePressIn = () => {
    if (!onPress || disabled) return
    pressed.value = withSpring(1, { mass: 0.5 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    if (!onPress || disabled) return
    pressed.value = withSpring(0, { mass: 0.5 })
  }

  const animatedStyle = useAnimatedStyle(() => {
    if (!onPress || disabled) return {}
    return {
      transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }]
    }
  })

  const cardStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    ...shadows.sm, // Soft shadow
    shadowColor: theme.textPrimary,
    shadowOpacity: 0.05,
  }

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[cardStyle, animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    )
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  )
}
