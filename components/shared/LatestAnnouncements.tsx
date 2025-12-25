import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Badge } from '@/components/ui'
import { Announcement } from '@/types'
import { spacing } from '@/constants/theme'

interface LatestAnnouncementsProps {
  announcements: Announcement[]
  onSeeAll?: () => void
  onAnnouncementPress: (announcement: Announcement) => void
  limit?: number
}

export function LatestAnnouncements({
  announcements,
  onSeeAll,
  onAnnouncementPress,
  limit = 3,
}: LatestAnnouncementsProps) {
  const { theme } = useTheme()

  const displayAnnouncements = announcements.slice(0, limit)

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text variant="h4" style={{ color: theme.textPrimary }}>
          Pengumuman Terbaru
        </Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text
              variant="bodySmall"
              style={{ color: theme.primary, fontWeight: '600' }}
            >
              Lihat Semua
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {displayAnnouncements.length > 0 ? (
        displayAnnouncements.map((item) => (
          <Card
            key={item.id}
            style={StyleSheet.flatten([{ marginBottom: spacing.md }])}
          >
            <TouchableOpacity onPress={() => onAnnouncementPress(item)}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: spacing.xs,
                }}
              >
                <Text variant="caption" style={{ color: theme.textSecondary }}>
                  {new Date(item.published_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                {item.is_important && (
                  <Badge variant="error" size="sm">
                    Penting
                  </Badge>
                )}
              </View>
              <Text
                variant="h4"
                style={{ marginBottom: spacing.xs }}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.textSecondary }}
                numberOfLines={2}
              >
                {item.content.replace(/<[^>]*>?/gm, '')}
              </Text>
            </TouchableOpacity>
          </Card>
        ))
      ) : (
        <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
          Belum ada pengumuman terbaru.
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
})
