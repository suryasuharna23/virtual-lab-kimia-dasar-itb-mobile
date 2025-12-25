import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import {
  Text,
  Card,
  Button,
  LoadingSpinner,
  Badge,
} from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import type { Module, Group } from '@/types'
import { layout, spacing, borderRadius, colors, shadows } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function PraktikumScreen() {
  const { theme } = useTheme()
  const [modules, setModules] = useState<Module[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [modulesRes, groupsRes] = await Promise.all([
        api.get<Module[]>(endpoints.modules.list),
        api.get<Group[]>(endpoints.groups.list),
      ])

      if (modulesRes.success) {
        setModules(modulesRes.data)
      }
      if (groupsRes.success) {
        setGroups(groupsRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
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

  const handleDownloadModule = async (moduleId: string | number) => {
    Alert.alert('Download', 'Fitur unduh akan segera tersedia.')
  }

  const StatCard = ({
    title,
    count,
    icon,
    color,
    delay
  }: {
    title: string
    count: string | number
    icon: keyof typeof Ionicons.glyphMap
    color: string
    delay: number
  }) => (
    <Animated.View 
      style={{ flex: 1 }}
      entering={FadeInDown.delay(delay).springify()}
    >
      <Card
        style={{
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          ...shadows.sm,
        }}
      >
        <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: borderRadius.lg, 
            backgroundColor: color + '15', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View>
            <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
                {count}
            </Text>
            <Text variant="caption" style={{ color: theme.textSecondary, fontWeight: '600' }}>
                {title}
            </Text>
        </View>
      </Card>
    </Animated.View>
  )

  if (isLoading) {
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
            Praktikum
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary }}>
            Selesaikan semua modul untuk menjadi ahli kimia! 🧪
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Modul"
            count={modules.length}
            icon="book"
            color={theme.primary}
            delay={0}
          />
          <StatCard
            title="Kelompok"
            count={groups.length || '-'}
            icon="people"
            color={colors.success}
            delay={100}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3" style={{ color: theme.textPrimary, fontWeight: '800' }}>
              Jalur Belajar
            </Text>
            <Badge variant="primary" size="sm">
              {`${modules.length} Level`}
            </Badge>
          </View>

          {modules.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={theme.textMuted}
              />
              <Text style={{ color: theme.textMuted, marginTop: 8 }}>
                Belum ada modul tersedia
              </Text>
            </View>
          ) : (
            modules.map((item, index) => (
              <Animated.View 
                key={item.id} 
                entering={FadeInDown.delay(200 + (index * 100)).springify()}
              >
                <Card 
                    style={styles.card}
                    onPress={() => handleDownloadModule(item.id)}
                >
                  <View style={styles.cardContent}>
                    <View style={{
                        width: 56,
                        height: 56,
                        borderRadius: borderRadius.xl,
                        backgroundColor: index % 2 === 0 ? theme.primary + '15' : theme.accent + '15',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Text style={{ 
                            fontSize: 24, 
                            fontWeight: '800', 
                            color: index % 2 === 0 ? theme.primary : theme.accent 
                        }}>
                            {index + 1}
                        </Text>
                    </View>
                    
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text
                        variant="bodyLarge"
                        style={{ color: theme.textPrimary, fontWeight: '700' }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        variant="caption"
                        style={{ color: theme.textSecondary }}
                        numberOfLines={2}
                      >
                        {item.description || 'Tidak ada deskripsi'}
                      </Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                         <Badge variant="info" size="sm">
                            {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : 'PDF'}
                         </Badge>
                      </View>
                    </View>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleDownloadModule(item.id)}
                        style={{ height: 40, width: 40, paddingHorizontal: 0 }}
                    >
                        <Ionicons name="cloud-download-outline" size={24} color={theme.primary} />
                    </Button>
                  </View>
                </Card>
              </Animated.View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3" style={{ color: theme.textPrimary, fontWeight: '800' }}>
              Tim Kamu
            </Text>
          </View>

          {groups.length === 0 ? (
            <Card>
                <View style={styles.emptyState}>
                <Ionicons
                    name="people-outline"
                    size={48}
                    color={theme.textMuted}
                />
                <Text style={{ color: theme.textMuted, marginTop: 8 }}>
                    Belum ada data kelompok
                </Text>
                </View>
            </Card>
          ) : (
            groups.map((group, index) => (
              <Animated.View key={group.id} entering={FadeInDown.delay(500 + (index * 100)).springify()}>
                  <Card style={styles.groupCard}>
                    <View style={styles.groupCardContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: borderRadius.xl, 
                            backgroundColor: colors.info + '15', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Ionicons name="people" size={24} color={colors.info} />
                        </View>
                        <View>
                            <Text
                            variant="bodyLarge"
                            style={{ color: theme.textPrimary, fontWeight: '700' }}
                            >
                            {group.name}
                            </Text>
                            <Text
                            variant="caption"
                            style={{ color: theme.textSecondary }}
                            >
                            {group.cohort || 'Umum'}
                            </Text>
                        </View>
                      </View>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleDownloadModule(group.id)}
                      >
                        <Ionicons
                          name="download-outline"
                          size={24}
                          color={colors.info}
                        />
                      </Button>
                    </View>
                  </Card>
              </Animated.View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  header: {
    marginBottom: layout.sectionGap,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: layout.sectionGap,
  },
  statCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
  },
  section: {
    marginBottom: layout.sectionGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  groupCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  groupCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
