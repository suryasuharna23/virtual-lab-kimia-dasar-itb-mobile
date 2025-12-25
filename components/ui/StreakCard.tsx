import React from 'react'
import { View, ViewStyle } from 'react-native'
import { Text } from './Text'
import { Button } from './Button'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, borderRadius, colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

interface StreakCardProps {
  streakCount: number
  completedDays: boolean[] // Array of 7 booleans for Mon-Sun
  onRewardPress?: () => void
  style?: ViewStyle
}

export function StreakCard({
  streakCount,
  completedDays,
  onRewardPress,
  style,
}: StreakCardProps) {
  const { theme } = useTheme()
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

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
            Track your streak
          </Text>
          <Text variant="bodySmall" color="secondary">
            Keep it up!
          </Text>
        </View>
        
        <View style={{ 
          backgroundColor: colors.warningSoft, 
          borderRadius: borderRadius.full, 
          paddingHorizontal: spacing.md, 
          paddingVertical: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Ionicons name="flame" size={16} color={colors.warning} style={{ marginRight: 4 }} />
          <Text variant="bodySmall" weight="bold" style={{ color: colors.warning }}>
            {streakCount} Streak
          </Text>
        </View>
      </View>

      {/* Days Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        {days.map((day, index) => {
          const isCompleted = completedDays[index]
          return (
            <View key={index} style={{ alignItems: 'center' }}>
              <View style={{ 
                width: 32, 
                height: 32, 
                borderRadius: borderRadius.full, 
                backgroundColor: isCompleted ? colors.white : 'rgba(255,255,255,0.5)',
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 4
              }}>
                {isCompleted ? (
                   <Ionicons name="checkmark" size={20} color={colors.warning} />
                ) : (
                   <Text variant="caption" style={{ color: theme.textPrimary, opacity: 0.5 }}>{day}</Text>
                )}
              </View>
            </View>
          )
        })}
      </View>

      <Button 
        onPress={onRewardPress}
        variant="primary"
        fullWidth
        size="md"
      >
        Get a reward
      </Button>
    </View>
  )
}
