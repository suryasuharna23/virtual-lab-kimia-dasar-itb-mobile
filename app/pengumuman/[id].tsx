import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Badge, LoadingSpinner } from '@/components/ui'
import { api } from '@/lib/api'
import { API_BASE_URL, endpoints } from '@/constants/api'
import { Announcement } from '@/types'
import { layout, spacing, borderRadius } from '@/constants/theme'

export default function AnnouncementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      setError(null)
      const response = await api.get<Announcement>(endpoints.announcements.get(id))
      if (response.success) {
        setAnnouncement(response.data)
      } else {
        setError('Pengumuman tidak ditemukan')
      }
    } catch (err) {
      setError('Gagal memuat pengumuman')
      console.error('Error fetching announcement:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '')
  }

  const handleDownload = (attachment: string) => {
    const url = attachment.startsWith('http')
      ? attachment
      : `${API_BASE_URL}${attachment}`
    Linking.openURL(url)
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <LoadingSpinner size="lg" />
      </View>
    )
  }

  if (error || !announcement) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text variant="h3">Pengumuman</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textMuted} />
          <Text style={{ color: theme.textMuted, marginTop: spacing.md }}>
            {error || 'Pengumuman tidak ditemukan'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3">Pengumuman</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        contentContainerStyle={styles.content}
      >
        {announcement.is_important && (
          <Badge variant="error" style={{ alignSelf: 'flex-start', marginBottom: spacing.sm }}>
            Penting
          </Badge>
        )}

        <Text variant="h1" style={{ marginBottom: spacing.sm }}>
          {announcement.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
          <Text variant="bodySmall" style={{ color: theme.textSecondary, marginLeft: spacing.xs }}>
            {formatDate(announcement.published_at)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text variant="body" style={{ lineHeight: 24, color: theme.textPrimary }}>
          {stripHtml(announcement.content)}
        </Text>

        {announcement.attachments && announcement.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text variant="h4" style={{ marginBottom: spacing.md }}>
              Lampiran
            </Text>
            {announcement.attachments.map((attachment, index) => {
              const fileName = attachment.split('/').pop() || `Lampiran ${index + 1}`
              return (
                <Card key={index} style={{ marginBottom: spacing.sm }}>
                  <TouchableOpacity
                    style={styles.attachmentItem}
                    onPress={() => handleDownload(attachment)}
                  >
                    <View style={styles.attachmentInfo}>
                      <Ionicons name="document-outline" size={24} color={theme.primary} />
                      <Text
                        variant="body"
                        style={{ marginLeft: spacing.sm, flex: 1 }}
                        numberOfLines={1}
                      >
                        {fileName}
                      </Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={theme.primary} />
                  </TouchableOpacity>
                </Card>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  attachmentsSection: {
    marginTop: spacing.xl,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
})
