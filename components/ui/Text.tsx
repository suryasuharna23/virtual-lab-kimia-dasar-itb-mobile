import React from 'react'
import { Text as RNText, TextProps as RNTextProps } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { fontSize, lineHeight, fontWeight, colors } from '@/constants/theme'

interface TextProps extends RNTextProps {
  variant?:
    | 'display'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'bodyLarge'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'overline'
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'error' | 'success'
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  children: React.ReactNode
}

export function Text({
  variant = 'body',
  color = 'primary',
  weight,
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  const { theme } = useTheme()

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return theme.textPrimary
      case 'secondary':
        return theme.textSecondary
      case 'muted':
        return theme.textMuted
      case 'accent':
        return theme.accent
      case 'error':
        return colors.error
      case 'success':
        return colors.success
      default:
        return theme.textPrimary
    }
  }

  const getDefaultWeight = () => {
    if (weight) return fontWeight[weight]
    
    switch (variant) {
      case 'display':
      case 'h1':
      case 'h2':
        return fontWeight.bold
      case 'h3':
      case 'h4':
      case 'bodyLarge':
        return fontWeight.semibold
      case 'caption':
      case 'overline':
        return fontWeight.medium
      default:
        return fontWeight.regular
    }
  }

  const textStyle = {
    fontSize: fontSize[variant],
    lineHeight: lineHeight[variant],
    color: getTextColor(),
    fontWeight: getDefaultWeight(),
    textAlign: align,
  }

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  )
}
