import React from 'react'
import { Pressable, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/contexts/ThemeContext'
import { borderRadius, spacing, colors } from '@/constants/theme'
import { Text } from './Text'
import { Ionicons } from '@expo/vector-icons'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconName?: keyof typeof Ionicons.glyphMap
  onPress?: () => void
  children: React.ReactNode
  style?: ViewStyle
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconName,
  onPress,
  children,
  style,
}: ButtonProps) {
  const { theme, isDark } = useTheme()
  
  // Animation values
  const pressed = useSharedValue(0)

  const handlePressIn = () => {
    if (disabled || loading) return
    pressed.value = withSpring(1, { mass: 0.5 })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handlePressOut = () => {
    if (disabled || loading) return
    pressed.value = withSpring(0, { mass: 0.5 })
  }

  // Determine colors based on variant
  const getColors = () => {
    if (disabled) {
      return {
        bg: theme.border,
        border: theme.textMuted, // A bit darker than bg for the 3D effect on disabled? Maybe just flat.
        text: theme.textMuted,
      }
    }

    switch (variant) {
      case 'primary':
        return {
          bg: theme.primary,
          border: theme.primaryDark || '#000',
          text: isDark ? theme.primary : colors.white,
        }
      case 'secondary':
        return {
          bg: theme.primarySoft,
          border: theme.primary,
          text: theme.primary,
        }
      case 'accent':
        return {
          bg: theme.accent,
          border: theme.accentDark || '#B45309',
          text: colors.white,
        }
      case 'success':
        return {
          bg: colors.success,
          border: colors.successDark || '#059669',
          text: colors.white,
        }
      case 'danger':
        return {
          bg: colors.error,
          border: colors.errorDark || '#B91C1C',
          text: colors.white,
        }
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: theme.primary,
        }
      default:
        return {
          bg: theme.primary,
          border: theme.primaryDark || '#000',
          text: colors.white,
        }
    }
  }

  const colorScheme = getColors()
  const isGhost = variant === 'ghost'

  // Styles based on size
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          fontSize: 14,
          height: 36,
          borderBottom: 3
        }
      case 'lg':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          fontSize: 18,
          height: 56,
          borderBottom: 5
        }
      default: // md
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          fontSize: 16,
          height: 48,
          borderBottom: 4
        }
    }
  }

  const dims = getDimensions()

  const animatedStyle = useAnimatedStyle(() => {
    if (isGhost) {
      return {
        opacity: interpolate(pressed.value, [0, 1], [1, 0.7]),
        transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.95]) }]
      }
    }

    const translateY = interpolate(pressed.value, [0, 1], [0, dims.borderBottom])
    // We want the visual button to move down, effectively hiding the borderBottom
    
    return {
      transform: [{ translateY }],
    }
  })
  
  // The container background is the "shadow" (border color)
  // The inner view is the face of the button
  
  // Actually, a simpler way to do 3D buttons in RN:
  // Outer view has the "Shadow" color and rounded corners.
  // Inner view has the "Main" color, rounded corners, and margin/padding to show the shadow.
  // When pressed, Inner view translates down to cover the shadow.
  
  return (
    <AnimatedPressable
      onPress={!disabled && !loading ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          width: fullWidth ? '100%' : undefined,
          height: dims.height,
          backgroundColor: isGhost ? 'transparent' : colorScheme.border,
          borderRadius: borderRadius.xl, // Pill shape-ish or rounded rect
          marginBottom: isGhost ? 0 : 0, // No margin needed, height includes the 3D part
        },
        style
      ]}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: colorScheme.bg,
            borderRadius: borderRadius.xl,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: dims.paddingHorizontal,
            // The magic:
            marginBottom: isGhost ? 0 : dims.borderBottom,
            marginTop: isGhost ? 0 : 0,
            borderWidth: isGhost ? 0 : 1.5, // Subtle outline for definition
            borderColor: isGhost ? 'transparent' : 'rgba(255,255,255,0.2)', // Inner highlight or just clean
          },
          animatedStyle
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colorScheme.text} size="small" />
        ) : (
          <>
            {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
            {iconName && (
              <Ionicons 
                name={iconName} 
                size={dims.fontSize + 4} 
                color={colorScheme.text} 
                style={{ marginRight: spacing.sm }}
              />
            )}
            <Text
              style={{
                color: colorScheme.text,
                fontSize: dims.fontSize,
                fontWeight: '700', // Chunky text
                fontFamily: undefined, // System font bold is usually good enough
              }}
            >
              {children}
            </Text>
            {rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
          </>
        )}
      </Animated.View>
    </AnimatedPressable>
  )
}
