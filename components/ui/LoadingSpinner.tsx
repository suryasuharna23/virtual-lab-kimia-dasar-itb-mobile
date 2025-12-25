import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated'
import { useTheme } from '@/contexts/ThemeContext'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function LoadingSpinner({ size = 'md', color }: LoadingSpinnerProps) {
  const { theme } = useTheme()
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    )
    return () => {
      cancelAnimation(rotation)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    }
  })

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 16
      case 'md':
        return 24
      case 'lg':
        return 32
      default:
        return 24
    }
  }

  const spinnerSize = getSize()
  const thickness = size === 'sm' ? 2 : size === 'md' ? 3 : 4
  const spinnerColor = color || theme.primary

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          animatedStyle,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderWidth: thickness,
            borderColor: theme.border, // Track color
            borderTopColor: spinnerColor, // Active color
            borderRadius: spinnerSize / 2,
          },
        ]}
      />
    </View>
  )
}
