import React from 'react'
import { View, ViewStyle } from 'react-native'
import { Text } from './Text'
import { Button } from './Button'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, borderRadius, colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

interface ProgressCardProps {
  totalModules: number
  completedModules: number
  onContinuePress?: () => void
  style?: ViewStyle
}

export function ProgressCard({
  totalModules,
  completedModules,
  onContinuePress,
  style,
}: ProgressCardProps) {
  const { theme } = useTheme()
  
  const progressPercentage = totalModules > 0 
    ? Math.round((completedModules / totalModules) * 100) 
    : 0

  const getProgressMessage = () => {
    if (totalModules === 0) return 'Belum ada modul tersedia'
    if (completedModules === 0) return 'Mulai praktikum pertamamu!'
    if (completedModules === totalModules) return 'Selamat! Semua modul selesai 🎉'
    return `${totalModules - completedModules} modul lagi untuk selesai`
  }

  const getProgressColor = () => {
    if (progressPercentage >= 100) return colors.success
    if (progressPercentage >= 50) return colors.info
    return colors.accent
  }

  return (
    <View style={[
      {
        backgroundColor: theme.surfacePurple,
        borderRadius: borderRadius['2xl'],
        padding: spacing.lg,
      },
      style
    ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text variant="h4" weight="bold" style={{ marginBottom: spacing.xs }}>
            Progress Praktikum
          </Text>
          <Text variant="bodySmall" color="secondary">
            {getProgressMessage()}
          </Text>
        </View>
        
        <View style={{ 
          backgroundColor: getProgressColor() + '20', 
          borderRadius: borderRadius.full, 
          paddingHorizontal: spacing.md, 
          paddingVertical: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Ionicons name="flask" size={16} color={getProgressColor()} style={{ marginRight: 4 }} />
          <Text variant="bodySmall" weight="bold" style={{ color: getProgressColor() }}>
            {progressPercentage}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ 
        height: 8, 
        backgroundColor: 'rgba(255,255,255,0.5)', 
        borderRadius: borderRadius.full,
        marginBottom: spacing.md,
        overflow: 'hidden'
      }}>
        <View style={{ 
          height: '100%', 
          width: `${progressPercentage}%`, 
          backgroundColor: getProgressColor(),
          borderRadius: borderRadius.full,
        }} />
      </View>

      {/* Module Icons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        {Array.from({ length: Math.min(totalModules, 7) }).map((_, index) => {
          const isCompleted = index < completedModules
          return (
            <View key={index} style={{ alignItems: 'center' }}>
              <View style={{ 
                width: 32, 
                height: 32, 
                borderRadius: borderRadius.full, 
                backgroundColor: isCompleted ? colors.white : 'rgba(255,255,255,0.5)',
                alignItems: 'center', 
                justifyContent: 'center',
              }}>
                {isCompleted ? (
                   <Ionicons name="checkmark" size={20} color={colors.success} />
                ) : (
                   <Text variant="caption" style={{ color: theme.textPrimary, opacity: 0.5 }}>
                     {index + 1}
                   </Text>
                )}
              </View>
            </View>
          )
        })}
        {totalModules > 7 && (
          <View style={{ alignItems: 'center' }}>
            <View style={{ 
              width: 32, 
              height: 32, 
              borderRadius: borderRadius.full, 
              backgroundColor: 'rgba(255,255,255,0.5)',
              alignItems: 'center', 
              justifyContent: 'center',
            }}>
              <Text variant="caption" style={{ color: theme.textPrimary, opacity: 0.7 }}>
                +{totalModules - 7}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Button 
        onPress={onContinuePress}
        variant="primary"
        fullWidth
        size="md"
      >
        {completedModules === totalModules ? 'Lihat Semua Modul' : 'Lanjutkan Belajar'}
      </Button>
    </View>
  )
}
