import React from 'react'
import { View, ViewStyle } from 'react-native'
import { Text } from './Text'
import { Button } from './Button'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, borderRadius, colors } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

export interface PraktikumSession {
  id: string
  moduleNumber: number
  moduleName: string
  date: string
  attended: boolean
}

interface AttendanceCardProps {
  sessions: PraktikumSession[] // Array of praktikum sessions
  onShowNametagPress?: () => void
  style?: ViewStyle
}

export function AttendanceCard({
  sessions,
  onShowNametagPress,
  style,
}: AttendanceCardProps) {
  const { theme } = useTheme()
  
  // Calculate attendance streak (consecutive attended sessions from start)
  const attendedCount = sessions.filter(s => s.attended).length
  const totalSessions = sessions.length
  
  // Get streak (consecutive attendance)
  let streakCount = 0
  for (const session of sessions) {
    if (session.attended) {
      streakCount++
    } else {
      break
    }
  }

  const getStreakMessage = () => {
    if (totalSessions === 0) return 'Belum ada jadwal praktikum'
    if (attendedCount === 0) return 'Mulai kehadiran pertamamu!'
    if (attendedCount === totalSessions) return 'Sempurna! Kehadiran 100% 🎉'
    return `${attendedCount}/${totalSessions} praktikum dihadiri`
  }

  // Show max 7 sessions, or fewer if less available
  const displaySessions = sessions.slice(0, 7)

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
            Kehadiran Praktikum
          </Text>
          <Text variant="bodySmall" color="secondary">
            {getStreakMessage()}
          </Text>
        </View>
        
        <View style={{ 
          backgroundColor: colors.successSoft, 
          borderRadius: borderRadius.full, 
          paddingHorizontal: spacing.md, 
          paddingVertical: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 4 }} />
          <Text variant="bodySmall" weight="bold" style={{ color: colors.success }}>
            {streakCount} Hadir
          </Text>
        </View>
      </View>

      {/* Sessions Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        {displaySessions.length > 0 ? (
          displaySessions.map((session, index) => {
            const isAttended = session.attended
            return (
              <View key={session.id} style={{ alignItems: 'center' }}>
                <View style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: borderRadius.full, 
                  backgroundColor: isAttended ? colors.white : 'rgba(255,255,255,0.5)',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: 4,
                  borderWidth: isAttended ? 2 : 0,
                  borderColor: colors.success,
                }}>
                  {isAttended ? (
                     <Ionicons name="checkmark" size={20} color={colors.success} />
                  ) : (
                     <Text variant="caption" weight="bold" style={{ color: theme.textPrimary, opacity: 0.6 }}>
                       {session.moduleNumber}
                     </Text>
                  )}
                </View>
                <Text variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                  M{session.moduleNumber}
                </Text>
              </View>
            )
          })
        ) : (
          // Empty state - show placeholder circles
          [1, 2, 3, 4, 5, 6, 7].map((num) => (
            <View key={num} style={{ alignItems: 'center' }}>
              <View style={{ 
                width: 36, 
                height: 36, 
                borderRadius: borderRadius.full, 
                backgroundColor: 'rgba(255,255,255,0.3)',
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 4
              }}>
                <Text variant="caption" style={{ color: theme.textPrimary, opacity: 0.4 }}>{num}</Text>
              </View>
              <Text variant="caption" style={{ color: theme.textSecondary, fontSize: 10, opacity: 0.5 }}>
                M{num}
              </Text>
            </View>
          ))
        )}
      </View>

      <Button 
        onPress={onShowNametagPress}
        variant="primary"
        fullWidth
        size="md"
        leftIcon={<Ionicons name="qr-code" size={18} color={colors.white} />}
      >
        Tampilkan Nametag
      </Button>
    </View>
  )
}
