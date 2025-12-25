import React from 'react'
import { View, ViewStyle, Pressable } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { borderRadius, spacing, colors } from '@/constants/theme'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface CardProps {
  variant?: 'standard' | 'colored' | 'floating' | 'interactive'
  colorScheme?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
}

export function Card({
  variant = 'standard',
  colorScheme = 'neutral',
  children,
  style,
  onPress,
}: CardProps) {
  const { theme } = useTheme()
  const pressed = useSharedValue(0)

  // 3D effect config
  const borderBottomHeight = 4
  
  const handlePressIn = () => {
    if (!onPress) return
    pressed.value = withSpring(1, { mass: 0.5 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    if (!onPress) return
    pressed.value = withSpring(0, { mass: 0.5 })
  }

  const getBackgroundColor = () => {
    if (colorScheme === 'neutral') return theme.surface
    switch (colorScheme) {
      case 'primary': return theme.primarySoft
      case 'accent': return theme.accentSoft
      case 'success': return colors.successSoft
      case 'warning': return colors.warningSoft
      case 'error': return colors.errorSoft
      case 'info': return colors.infoSoft
      default: return theme.surface
    }
  }

  const getBorderColor = () => {
    // Return a darker shade for the "3D" bottom
    if (colorScheme === 'neutral') return theme.border
    switch (colorScheme) {
      case 'primary': return theme.primaryLight
      case 'accent': return theme.accent
      case 'success': return colors.success
      case 'warning': return colors.warning
      case 'error': return colors.error
      case 'info': return colors.info
      default: return theme.border
    }
  }

  const bgColor = getBackgroundColor()
  const borderColor = getBorderColor()
  
  const isInteractive = !!onPress || variant === 'interactive'

  const animatedInnerStyle = useAnimatedStyle(() => {
    if (!isInteractive) return {}
    return {
      transform: [{ translateY: withSpring(pressed.value * borderBottomHeight) }]
    }
  })

  // If not interactive, just render a standard view with optional styling
  if (!isInteractive && variant !== 'floating') {
    return (
      <View style={[
        {
          backgroundColor: bgColor,
          borderRadius: borderRadius.xl,
          borderWidth: 2,
          borderColor: theme.border, // Standard cards have a light border
          padding: spacing.lg,
        },
        style
      ]}>
        {children}
      </View>
    )
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[
        {
          backgroundColor: borderColor, // This acts as the shadow/3D part
          borderRadius: borderRadius.xl,
          paddingBottom: isInteractive ? 0 : 0, // The height comes from the inner view margin
        },
        style
      ]}
    >
      <Animated.View style={[
        {
          backgroundColor: bgColor,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          borderWidth: 2,
          borderColor: borderColor,
          marginBottom: isInteractive ? borderBottomHeight : 0,
        },
        animatedInnerStyle
      ]}>
        {children}
      </Animated.View>
    </AnimatedPressable>
  )
}
