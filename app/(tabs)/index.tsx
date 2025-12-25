import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Badge, LoadingSpinner, Button } from '@/components/ui'
import { api } from '@/lib/api'
import { API_BASE_URL, endpoints } from '@/constants/api'
import { Slider, Announcement } from '@/types'
import { layout, spacing, colors, borderRadius } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SLIDER_ASPECT_RATIO = 16 / 9
const SLIDER_WIDTH = SCREEN_WIDTH - layout.screenPaddingHorizontal * 2
const SLIDER_HEIGHT = SLIDER_WIDTH / SLIDER_ASPECT_RATIO

interface QuickAccessItem {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  route: string
  color: string
  onPress?: () => void
}

export default function HomeScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sliders, setSliders] = useState<Slider[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const sliderRef = useRef<FlatList>(null)

  const fetchData = useCallback(async () => {
    try {
      const [slidersRes, announcementsRes] = await Promise.all([
        api.get<Slider[]>(endpoints.sliders.list),
        api.getWithQuery<Announcement[]>(endpoints.announcements.list, {
          limit: 3,
        }),
      ])

      if (slidersRes.success) {
        setSliders(
          slidersRes.data.sort((a, b) => a.order_index - b.order_index)
        )
      }
      if (announcementsRes.success) {
        setAnnouncements(announcementsRes.data)
      }
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  // Auto-scroll slider
  useEffect(() => {
    if (sliders.length <= 1) return

    const interval = setInterval(() => {
      if (activeSlide < sliders.length - 1) {
        sliderRef.current?.scrollToIndex({ index: activeSlide + 1 })
        setActiveSlide((prev) => prev + 1)
      } else {
        sliderRef.current?.scrollToIndex({ index: 0 })
        setActiveSlide(0)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [activeSlide, sliders.length])

  const renderSliderItem = ({ item }: { item: Slider }) => (
    <View style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT, marginRight: spacing.md }}>
       <View style={{ flex: 1, borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 2, borderColor: theme.border }}>
        <Image
            source={{ uri: `${API_BASE_URL}${item.image_path}` }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessibilityLabel={item.alt_text}
        />
        <View style={[styles.sliderCaption, { backgroundColor: 'rgba(30, 27, 75, 0.8)' }]}>
            <Text variant="h4" style={{ color: '#fff', fontWeight: 'bold' }}>
            {item.title}
            </Text>
        </View>
      </View>
    </View>
  )

  const quickAccessItems: QuickAccessItem[] = [
    {
      title: 'Praktikum',
      icon: 'book',
      route: '/praktikum',
      color: theme.primary,
    },
    {
      title: 'Virtual Lab',
      icon: 'flask',
      route: '/virtual-lab',
      color: theme.accent,
    },
    {
      title: 'Nilai',
      icon: 'document-text',
      route: '/nilai',
      color: colors.success,
      onPress: () => Alert.alert('Info', 'Fitur Nilai akan segera tersedia!'),
    },
    {
      title: 'Kontak',
      icon: 'mail',
      route: '/kontak',
      color: colors.info,
    },
  ]

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH)
    setActiveSlide(index)
  }

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <LoadingSpinner size="lg" />
      </View>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Playful Header */}
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{ 
                width: 50, 
                height: 50, 
                borderRadius: 25, 
                backgroundColor: theme.primarySoft, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: spacing.md,
                borderWidth: 2,
                borderColor: theme.primary
            }}>
                <Image
                    source={require('@/assets/images/itb-logo.png')}
                    style={{ width: 30, height: 30 }}
                    contentFit="contain"
                />
            </View>
            <View>
                <Text
                variant="h3"
                style={{ color: theme.textPrimary, fontWeight: '800' }}
                >
                Lab Kimia
                </Text>
                <Text variant="bodySmall" style={{ color: theme.textSecondary, fontWeight: '600' }}>
                Siap belajar hari ini? 🚀
                </Text>
            </View>
          </View>
        </View>

        {/* Hero Slider */}
        <View style={styles.sliderContainer}>
          {sliders.length > 0 ? (
            <>
              <FlatList
                ref={sliderRef}
                data={sliders}
                renderItem={renderSliderItem}
                keyExtractor={(item) => String(item.id)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                snapToInterval={SLIDER_WIDTH + spacing.md}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: layout.screenPaddingHorizontal }}
              />
              <View style={styles.pagination}>
                {sliders.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          index === activeSlide ? theme.primary : theme.border,
                        width: index === activeSlide ? 24 : 8,
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={{ paddingHorizontal: layout.screenPaddingHorizontal }}>
                <Card variant="standard" style={{ height: SLIDER_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: theme.textMuted }}>
                        Tidak ada gambar slider
                    </Text>
                </Card>
            </View>
          )}
        </View>

        {/* Quick Access Grid */}
        <View style={styles.section}>
          <Text
            variant="h4"
            style={{ marginBottom: spacing.md, color: theme.textPrimary, fontWeight: '800' }}
          >
            Mulai Belajar
          </Text>
          <View style={styles.grid}>
            {quickAccessItems.map((item, index) => (
                <Animated.View 
                    key={index} 
                    entering={FadeInDown.delay(index * 100).springify()}
                    style={{ width: '48%' }}
                >
                    <Card
                        variant="interactive"
                        colorScheme="neutral"
                        onPress={() => {
                            if (item.onPress) {
                                item.onPress()
                            } else if (item.route) {
                                router.push(item.route as any)
                            }
                        }}
                        style={{ height: 140, justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <View
                            style={[
                            styles.iconContainer,
                            { backgroundColor: item.color + '20' },
                            ]}
                        >
                            <Ionicons name={item.icon} size={32} color={item.color} />
                        </View>
                        <Text
                            variant="body"
                            style={{
                            textAlign: 'center',
                            fontWeight: '700',
                            color: theme.textPrimary
                            }}
                        >
                            {item.title}
                        </Text>
                    </Card>
                </Animated.View>
            ))}
          </View>
        </View>

        {/* Latest Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" style={{ color: theme.textPrimary, fontWeight: '800' }}>
              Papan Pengumuman
            </Text>
            <Link href={'/pengumuman' as any} asChild>
                <Button variant="ghost" size="sm">
                    Lihat Semua
                </Button>
            </Link>
          </View>

          {announcements.length > 0 ? (
            announcements.map((item, index) => (
               <Animated.View key={item.id} entering={FadeInDown.delay(400 + (index * 100)).springify()}>
                  <Card
                    variant="interactive"
                    style={StyleSheet.flatten([{ marginBottom: spacing.md }])}
                    onPress={() => router.push(`/pengumuman?id=${item.id}` as any)}
                  >
                    <View
                        style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: spacing.xs,
                        alignItems: 'center'
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                            <Text variant="caption" style={{ color: theme.textSecondary, fontWeight: '600' }}>
                            {new Date(item.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                            })}
                            </Text>
                        </View>
                        {item.is_important && (
                        <Badge variant="error" size="sm">
                            PENTING
                        </Badge>
                        )}
                    </View>
                    <Text
                        variant="h4"
                        style={{ marginBottom: spacing.sm, fontWeight: '700' }}
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
                  </Card>
              </Animated.View>
            ))
          ) : (
            <Card>
                <Text style={{ color: theme.textSecondary, fontStyle: 'italic', textAlign: 'center' }}>
                Belum ada pengumuman terbaru.
                </Text>
            </Card>
          )}
        </View>
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
  },
  sliderContainer: {
    marginBottom: spacing.xl,
  },
  sliderCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
})
