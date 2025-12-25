import React, { useState } from 'react'
import { TextInput, TextInputProps, View } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { borderRadius, spacing, colors, fontSize } from '@/constants/theme'
import { Text } from './Text'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (e: any) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: any) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const getBorderColor = () => {
    if (error) return colors.error
    if (isFocused) return theme.primary
    return theme.border
  }

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text
          variant="bodySmall"
          weight="medium"
          style={{ marginBottom: spacing.xs, color: theme.textSecondary }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: getBorderColor(),
          borderRadius: borderRadius.xl,
          backgroundColor: theme.surface,
          paddingHorizontal: spacing.md,
          height: 48,
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>
        )}
        <TextInput
          style={[
            {
              flex: 1,
              color: theme.textPrimary,
              fontSize: fontSize.body,
              height: '100%',
              paddingVertical: 0,
            },
            style,
          ]}
          placeholderTextColor={theme.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>
        )}
      </View>
      {error && (
        <Text
          variant="caption"
          style={{ color: colors.error, marginTop: spacing.xs }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}
