import React, { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, borderRadius, fontSize } from '@/constants/theme'

interface SearchBarProps {
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
  onFocus?: () => void
  style?: StyleProp<ViewStyle>
}

export function SearchBar({
  placeholder = 'Cari...',
  value,
  onChangeText,
  onSubmit,
  onFocus,
  style,
}: SearchBarProps) {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleClear = () => {
    onChangeText('')
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: isFocused ? theme.accent : theme.border,
        },
        style,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={isFocused ? theme.accent : theme.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: theme.textPrimary,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    height: '100%',
  },
})
