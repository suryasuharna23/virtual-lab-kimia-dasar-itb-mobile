import React from 'react'
import { View, Image, TouchableOpacity, Alert } from 'react-native'
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
}

export function UserHeader({
  name,
  level,
  avatarUrl,
  onNotificationPress,
}: UserHeaderProps) {
  const { theme } = useTheme()

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text variant="h4" weight="bold">
            {name}
          </Text>
          <View style={{ 
            width: 4, 
            height: 4, 
            borderRadius: 2, 
            backgroundColor: theme.textMuted
          }} />
          <Badge variant="primary" size="sm" style={{ alignSelf: 'center' }}>{level}</Badge>
          <TouchableOpacity 
            onPress={() => Alert.alert(
              'Level Kehadiran',
              "Level ini menunjukkan progress kehadiran praktikum kamu.\n\nBerikut adalah level akun yang tersedia yang terinspirasi dari motto ITB 'In Harmonia Progressio':\n\n• Initium (0-24%) - Baru memulai\n• Progressio (25-49%) - Dalam perkembangan\n• Harmonia (50-74%) - Selaras dan konsisten\n• Excellentia (75-100%) - Keunggulan tertinggi"
            )}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

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
  )
}
