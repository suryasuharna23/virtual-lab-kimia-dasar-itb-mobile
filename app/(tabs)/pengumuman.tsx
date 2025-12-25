import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import {
  Text,
  Card,
  Badge,
  LoadingSpinner,
} from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import type { Announcement } from '@/types'
import { layout, spacing, colors } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'

const ITEMS_PER_PAGE = 10

export default function PengumumanScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnnouncements = useCallback(async (pageNum: number, isRefresh = false) => {
    try {
      const response = await api.getWithQuery<Announcement[]>(
        endpoints.announcements.list,
        {
          page: pageNum,
          limit: ITEMS_PER_PAGE,
        }
      )

      if (response.success) {
        const newData = response.data
        if (isRefresh) {
          setAnnouncements(newData)
        } else {
          setAnnouncements((prev) => [...prev, ...newData])
        }
        
        // Check if we reached the end
        if (newData.length < ITEMS_PER_PAGE) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements(1, true)
  }, [fetchAnnouncements])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setPage(1)
    fetchAnnouncements(1, true)
  }, [fetchAnnouncements])

  const loadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true)
      const nextPage = page + 1
      setPage(nextPage)
      fetchAnnouncements(nextPage)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch (e) {
      return dateString
    }
  }

  const renderItem = ({ item, index }: { item: Announcement; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Card 
        style={styles.card}
        variant="interactive"
        colorScheme={item.is_important ? 'warning' : 'neutral'}
        onPress={() => router.push(`/pengumuman?id=${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                <Text variant="caption" style={{ color: theme.textSecondary, fontWeight: '600' }}>
                    {formatDate(item.published_at)}
                </Text>
            </View>
            {item.is_important && (
              <Badge variant="error" size="sm" style={{ marginLeft: spacing.sm }}>
                PENTING
              </Badge>
            )}
          </View>
          <Text
            variant="h4"
            style={{ color: theme.textPrimary, marginTop: spacing.xs, fontWeight: '700' }}
          >
            {item.title}
          </Text>
        </View>

        <Text
          variant="body"
          style={{ color: theme.textSecondary, marginTop: spacing.sm }}
          numberOfLines={3}
        >
          {item.content.replace(/<[^>]+>/g, '')}
        </Text>

        {/* Attachments indicator if any */}
        {item.attachments && item.attachments.length > 0 && (
          <View style={styles.attachmentContainer}>
            <Ionicons name="attach" size={16} color={theme.primary} />
            <Text variant="caption" style={{ color: theme.primary, fontWeight: '600' }}>
              {item.attachments.length} Lampiran
            </Text>
          </View>
        )}
      </Card>
    </Animated.View>
  )

  const renderFooter = () => {
    if (!isLoadingMore) return <View style={{ height: 100 }} />
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    )
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
        Papan Pengumuman
      </Text>
      <Text variant="body" style={{ color: theme.textSecondary }}>
        Jangan sampai ketinggalan info penting! 📢
      </Text>
    </View>
  )

  if (isLoading && !refreshing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <LoadingSpinner size="lg" color={theme.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={announcements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={theme.textMuted}
              />
              <Text style={{ color: theme.textMuted, marginTop: 8 }}>
                Tidak ada pengumuman
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  header: {
    marginBottom: layout.sectionGap,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    marginBottom: spacing.xs,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: 80,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    marginTop: spacing.xl,
  },
})
