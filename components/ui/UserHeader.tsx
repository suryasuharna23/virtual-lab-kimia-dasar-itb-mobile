import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { Text } from './Text'
import { Badge } from './Badge'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, borderRadius, colors, shadows } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

interface UserHeaderProps {
  name: string
  level: string
  avatarUrl?: string
  onNotificationPress?: () => void
  onGiftPress?: () => void
}

export function UserHeader({
  name,
  level,
  avatarUrl,
  onNotificationPress,
  onGiftPress,
}: UserHeaderProps) {
  const { theme } = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Avatar */}
        <View style={{ 
          width: 48, 
          height: 48, 
          borderRadius: borderRadius.full, 
          backgroundColor: colors.white,
          borderWidth: 2,
          borderColor: theme.border,
          marginRight: spacing.md,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {avatarUrl ? (
            <Image 
              source={{ uri: avatarUrl }} 
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
             <Ionicons name="person" size={24} color={theme.textMuted} />
          )}
        </View>

        {/* Name and Level */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="h4" weight="bold" style={{ marginRight: spacing.sm }}>
              {name}
            </Text>
            <View style={{ 
              width: 4, 
              height: 4, 
              borderRadius: 2, 
              backgroundColor: theme.textMuted, 
              marginRight: spacing.sm 
            }} />
            <Badge variant="primary" size="sm">{level}</Badge>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity 
          onPress={onGiftPress}
          style={{ 
            padding: spacing.sm,
            backgroundColor: theme.surface,
            borderRadius: borderRadius.full,
            marginRight: spacing.sm,
            ...shadows.sm
          }}
        >
          <Ionicons name="gift-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onNotificationPress}
          style={{ 
            padding: spacing.sm,
            backgroundColor: theme.surface,
            borderRadius: borderRadius.full,
            ...shadows.sm
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
