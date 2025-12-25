import React, { useEffect, useRef } from 'react'
import {
  Modal as RNModal,
  View,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
  ViewStyle,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { borderRadius, shadows, spacing } from '@/constants/theme'
import { Text } from './Text'

export interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
  showCloseButton?: boolean
  closeOnBackdropPress?: boolean
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropPress = true,
}: ModalProps) {
  const { theme } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 90,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, fadeAnim, slideAnim])

  const getSizeStyle = (): ViewStyle => {
    if (size === 'fullscreen') {
      return {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        margin: 0,
      }
    }

    const maxWidths = {
      sm: 300,
      md: 400,
      lg: 500,
    }

    return {
      width: '90%',
      maxWidth: maxWidths[size],
      maxHeight: '90%',
      borderRadius: borderRadius.xl,
    }
  }

  // If not visible and animation completed (handled by RN Modal unmount, 
  // but we keep it simple here by relying on visible prop for mounting)
  // However, RN Modal needs 'visible' prop to be true to show. 
  // If we want exit animations, we usually need to keep RN Modal visible 
  // until animation finishes. For simplicity and strictly following RN Modal,
  // we will just pass visible to RN Modal, but that kills the exit animation.
  // To support exit animation, we typically delay the visible=false passed to RN Modal.
  // But given the task constraints and "simple reusable component", I'll try to stick to standard behavior
  // or implement a small internal state for exit animation if needed.
  // Let's implement the internal visibility state for exit animations.

  const [modalVisible, setModalVisible] = React.useState(visible)

  useEffect(() => {
    if (visible) {
      setModalVisible(true)
    } else {
      const timer = setTimeout(() => setModalVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!modalVisible) return null

  return (
    <RNModal
      transparent
      visible={modalVisible}
      onRequestClose={onClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
              backgroundColor: 'rgba(0,0,0,0.5)', // Darken backdrop
            },
          ]}
        >
          <Pressable
            testID="modal-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={closeOnBackdropPress ? onClose : undefined}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            getSizeStyle(),
            {
              backgroundColor: theme.surface,
              transform: [{ translateY: slideAnim }],
            },
            size !== 'fullscreen' && shadows.xl,
          ]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View
              style={[
                styles.header,
                !title && styles.headerNoTitle,
                size === 'fullscreen' && styles.headerFullscreen,
              ]}
            >
              {title ? (
                <Text variant="h3" weight="bold" style={{ color: theme.textPrimary, flex: 1 }}>
                  {title}
                </Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              
              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    {
                      backgroundColor: pressed ? theme.border : 'transparent',
                    },
                  ]}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <Ionicons
                    name="close-outline"
                    size={24}
                    color={theme.textSecondary}
                  />
                </Pressable>
              )}
            </View>
          )}

          {/* Body */}
          <View style={[styles.body, size === 'fullscreen' && styles.bodyFullscreen]}>
            {children}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    overflow: 'hidden',
    // Default elevation/shadow is handled by props
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerFullscreen: {
    paddingTop: Platform.OS === 'ios' ? 48 : spacing.xl, // Safe area top
  },
  headerNoTitle: {
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: spacing.md,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  bodyFullscreen: {
    flex: 1,
  },
})
