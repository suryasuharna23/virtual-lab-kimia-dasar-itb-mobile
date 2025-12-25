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
import { layout, spacing, borderRadius, colors } from '@/constants/theme'
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
    bgColor,
    delay
  }: {
    title: string
    count: string | number
    icon: keyof typeof Ionicons.glyphMap
    color: string
    bgColor: string
    delay: number
  }) => (
    <Animated.View 
      style={{ flex: 1 }}
      entering={FadeInDown.delay(delay).springify()}
    >
      <Card
        variant="interactive"
        style={{
          backgroundColor: bgColor,
          borderColor: color, // The "3D" part will take this color if implemented in Card logic, but Card uses colorScheme
          padding: spacing.md,
          minHeight: 110,
          justifyContent: 'space-between',
          borderWidth: 0, // Override
        }}
        // We can't easily pass custom colors to the new Card component unless we add a 'custom' scheme or style override.
        // For now, let's use the style override to set background and let the card handle the 3D effect if possible.
        // Actually, the new Card component uses specific colorSchemes for the 3D effect color.
        // Let's rely on `colorScheme` prop if it matches, otherwise we might lose the 3D effect color.
        colorScheme={color === theme.primary ? 'primary' : color === theme.accent ? 'accent' : 'success'}
      >
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={28} color={color} />
          <Text variant="h2" style={{ color: color, fontWeight: '800' }}>
            {count}
          </Text>
        </View>
        <Text variant="caption" style={{ color: color, fontWeight: '700', opacity: 0.8 }}>
          {title}
        </Text>
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
            Praktikum
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary }}>
            Selesaikan semua modul untuk menjadi ahli kimia! 🧪
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Modul"
            count={modules.length}
            icon="book"
            color={theme.primary}
            bgColor={theme.primarySoft}
            delay={0}
          />
          <StatCard
            title="Kelompok"
            count={groups.length || '-'}
            icon="people"
            color={colors.success}
            bgColor={colors.successSoft}
            delay={100}
          />
        </View>

        {/* Modules Section */}
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
                    variant="interactive" 
                    style={styles.card}
                    onPress={() => handleDownloadModule(item.id)}
                    colorScheme="neutral"
                >
                  <View style={styles.cardHeader}>
                    {/* Level Number */}
                    <View style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: index % 2 === 0 ? theme.primary : theme.accent,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottomWidth: 4,
                        borderBottomColor: index % 2 === 0 ? theme.primaryDark : theme.accentDark || '#B45309',
                    }}>
                        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>
                            {index + 1}
                        </Text>
                    </View>
                    
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text
                        variant="bodyLarge"
                        style={{ color: theme.textPrimary, fontWeight: '700' }}
                      >
                        {item.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                         <Ionicons name="document-text-outline" size={14} color={theme.textSecondary} style={{marginRight: 4}} />
                         <Text
                            variant="caption"
                            style={{ color: theme.textSecondary }}
                        >
                            {item.file_size
                            ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB`
                            : 'PDF File'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ justifyContent: 'center' }}>
                        <Ionicons name="cloud-download-outline" size={24} color={theme.primary} />
                    </View>
                  </View>

                  {/* Optional Description */}
                  {item.description && (
                      <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border }}>
                         <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                            {item.description}
                         </Text>
                      </View>
                  )}
                </Card>
              </Animated.View>
            ))
          )}
        </View>

        {/* Groups Section */}
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
                  <Card variant="interactive" colorScheme="info" style={styles.groupCard}>
                    <View style={styles.groupCardContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="people" size={20} color="#fff" />
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
                          name="download"
                          size={20}
                          color={colors.info}
                        />
                      </Button>
                    </View>
                  </Card>
              </Animated.View>
            ))
          )}
        </View>

        {/* Footer Padding */}
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
  statHeader: {
    gap: spacing.sm,
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
  cardHeader: {
    flexDirection: 'row',
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
