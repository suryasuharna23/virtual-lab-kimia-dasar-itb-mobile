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
  // Tambahan prop baru untuk kontrol manual
  textColor?: string 
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
  textColor, // Destructure prop baru
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
    // 1. Jika disabled
    if (disabled) {
      return {
        bg: theme.border,
        text: theme.textMuted,
      }
    }

    // 2. Logic Dark Mode yang diperbaiki
    if (isDark) {
      const bg = (() => {
        switch (variant) {
          case 'primary': return theme.primary;
          case 'secondary': return theme.primarySoft;
          case 'accent': return theme.accent;
          case 'success': return colors.success;
          case 'danger': return colors.error;
          case 'ghost': return 'transparent';
          default: return theme.primary;
        }
      })();
      
      // Normalisasi ke lowercase agar #FFFFFF sama dengan #ffffff
      const bgLower = typeof bg === 'string' ? bg.toLowerCase() : '';
      
      // List warna terang yang HARUS pakai teks gelap
      const lightBgList = [
        colors.white.toLowerCase(), 
        '#ffffff', 
        '#fff', 
        'white',
        theme.surface.toLowerCase(), 
        theme.primarySoft.toLowerCase(), 
        theme.accentSoft.toLowerCase(),
        theme.primary.toLowerCase()
      ];
      
      // Cek apakah background termasuk warna terang
      const isLightBg = lightBgList.includes(bgLower);
      
      return {
        bg,
        // Jika background terang -> teks hitam (#1E1B4B)
        // Jika background gelap -> teks warna theme.textPrimary (biasanya putih)
        text: isLightBg ? '#1E1B4B' : theme.textPrimary,
      };
    }

    // 3. Logic Light Mode (Default)
    switch (variant) {
      case 'primary': return { bg: theme.primary, text: colors.white }
      case 'secondary': return { bg: theme.primarySoft, text: theme.primary }
      case 'accent': return { bg: theme.accent, text: colors.white }
      case 'success': return { bg: colors.success, text: colors.white }
      case 'danger': return { bg: colors.error, text: colors.white }
      case 'ghost': return { bg: 'transparent', text: theme.primary }
      default: return { bg: theme.primary, text: colors.white }
    }
  }

  // Styles based on size
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, fontSize: 14, height: 36 }
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: 18, height: 56 }
      default: // md
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: 16, height: 48 }
    }
  }

  const dims = getDimensions()
  const colorScheme = getColors();

  // PRIORITAS WARNA TEKS:
  // 1. Prop `textColor` manual (jika ada)
  // 2. Warna hasil kalkulasi `colorScheme.text`
  const finalTextColor = textColor || colorScheme.text;

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
        style // Style override user (hati-hati, ini menimpa backgroundColor tapi tidak text color)
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
          <ActivityIndicator color={finalTextColor} size="small" />
        ) : (
          <>
            {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
            {iconName && (
              <Ionicons 
                name={iconName} 
                size={dims.fontSize + 4} 
                color={finalTextColor} 
                style={{ marginRight: spacing.sm }}
              />
            )}
            <Text
              style={{
                color: finalTextColor, // Pakai finalTextColor
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