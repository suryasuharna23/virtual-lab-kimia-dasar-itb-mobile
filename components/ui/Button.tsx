import React from 'react'
import { Pressable, ActivityIndicator, ViewStyle, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
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
  const { theme } = useTheme()
  
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
        text: theme.textMuted,
      }
    }

    const isDark = (theme.background || '').toLowerCase() === '#0f0e1a';

    // For dark mode, always use #1E1B4B for text/icon
    if (isDark) {
      return {
        bg: (() => {
          switch (variant) {
            case 'primary': return theme.primary;
            case 'secondary': return theme.primarySoft;
            case 'accent': return theme.accent;
            case 'success': return colors.success;
            case 'danger': return colors.error;
            case 'ghost': return 'transparent';
            default: return theme.primary;
          }
        })(),
        text: '#1E1B4B',
      }
    }

    // Light mode: default logic
    switch (variant) {
      case 'primary':
        return {
          bg: theme.primary,
          text: colors.white,
        }
      case 'secondary':
        return {
          bg: theme.primarySoft,
          text: theme.primary,
        }
      case 'accent':
        return {
          bg: theme.accent,
          text: colors.white,
        }
      case 'success':
        return {
          bg: colors.success,
          text: colors.white,
        }
      case 'danger':
        return {
          bg: colors.error,
          text: colors.white,
        }
      case 'ghost':
        return {
          bg: 'transparent',
          text: theme.primary,
        }
      default:
        return {
          bg: theme.primary,
          text: colors.white,
        }
    }
  }
  // Styles based on size
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          fontSize: 14,
          height: 36,
        }
      case 'lg':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          fontSize: 18,
          height: 56,
        }
      default: // md
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          fontSize: 16,
          height: 48,
        }
    }
  }

  const dims = getDimensions()
  const colorScheme = getColors();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
      transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.98]) }]
    }
  })
  
  return (
    <AnimatedPressable
      onPress={!disabled && !loading ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          width: fullWidth ? '100%' : undefined,
          height: dims.height,
          backgroundColor: colorScheme.bg,
          borderRadius: borderRadius.full,
          justifyContent: 'center',
          alignItems: 'center',
        },
        animatedStyle,
        style
      ]}
      disabled={disabled || loading}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: dims.paddingHorizontal,
        }}
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
                fontWeight: '700',
              }}
            >
              {children}
            </Text>
            {rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
          </>
        )}
      </View>
    </AnimatedPressable>
  )
}
