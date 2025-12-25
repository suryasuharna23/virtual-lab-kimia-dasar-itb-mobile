import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Paths, File } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  Text,
  Card,
  LoadingSpinner,
  Badge,
} from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import type { Module, Group } from '@/types'
import { layout, spacing, borderRadius, colors, shadows } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'

const OFFLINE_FILES_KEY = 'offline_files'

interface OfflineFile {
  id: string
  name: string
  localPath: string
  type: 'module' | 'group'
  downloadedAt: string
  size: number
}

export default function PraktikumScreen() {
  const { theme } = useTheme()
  const [modules, setModules] = useState<Module[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)
  const [offlineFiles, setOfflineFiles] = useState<OfflineFile[]>([])

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

  const loadOfflineFiles = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_FILES_KEY)
      if (stored) {
        setOfflineFiles(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading offline files:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    loadOfflineFiles()
  }, [fetchData, loadOfflineFiles])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  const isDownloaded = (id: string | number) => {
    return offlineFiles.some(f => f.id === String(id))
  }

  const handleDownloadModule = async (module: Module) => {
    if (isDownloaded(module.id)) {
      Alert.alert(
        'File Sudah Diunduh',
        'File ini sudah tersimpan offline. Buka di halaman Offline Files?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Lihat', onPress: () => {} }
        ]
      )
      return
    }

    try {
      setDownloadingId(module.id)
      
      const response = await api.get<{ download_url: string; expires_at: string }>(
        endpoints.modules.download(module.id)
      )
      
      if (!response.success || !response.data?.download_url) {
        throw new Error('Gagal mendapatkan URL download')
      }

      const downloadUrl = response.data.download_url
      const fileName = `modul_${module.id}_${Date.now()}.pdf`
      const file = new File(Paths.cache, fileName)
      
      const fetchResponse = await fetch(downloadUrl)
      if (!fetchResponse.ok) {
        throw new Error('Download gagal')
      }
      
      const blob = await fetchResponse.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      file.write(uint8Array)

      const newOfflineFile: OfflineFile = {
        id: String(module.id),
        name: module.title,
        localPath: file.uri,
        type: 'module',
        downloadedAt: new Date().toISOString(),
        size: module.file_size || 0,
      }

      const updatedFiles = [...offlineFiles, newOfflineFile]
      await AsyncStorage.setItem(OFFLINE_FILES_KEY, JSON.stringify(updatedFiles))
      setOfflineFiles(updatedFiles)

      Alert.alert(
        'Berhasil! ✓',
        `${module.title} berhasil diunduh dan tersimpan offline.`,
        [
          { text: 'OK' },
          { 
            text: 'Buka File', 
            onPress: () => Sharing.shareAsync(file.uri)
          }
        ]
      )
    } catch (error) {
      console.error('Download error:', error)
      Alert.alert('Gagal', 'Tidak dapat mengunduh file. Coba lagi nanti.')
    } finally {
      setDownloadingId(null)
    }
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
            modules.map((item, index) => {
              const isDownloading = downloadingId === item.id
              const downloaded = isDownloaded(item.id)
              
              return (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInDown.delay(200 + (index * 100)).springify()}
                >
                  <Card style={styles.card}>
                    <View style={styles.cardContent}>
                      <View style={styles.moduleNumber}>
                        <Text style={[
                          styles.moduleNumberText,
                          { color: index % 2 === 0 ? theme.primary : theme.accent }
                        ]}>
                          {index + 1}
                        </Text>
                      </View>
                      
                      <View style={styles.moduleInfo}>
                        <Text
                          variant="bodyLarge"
                          style={{ color: theme.textPrimary, fontWeight: '700' }}
                          numberOfLines={1}
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
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                          <Badge variant="info" size="sm">
                            {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : 'PDF'}
                          </Badge>
                          {downloaded && (
                            <Badge variant="success" size="sm">
                              Tersimpan
                            </Badge>
                          )}
                        </View>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => handleDownloadModule(item)}
                        disabled={isDownloading}
                        style={[
                          styles.downloadButton,
                          { backgroundColor: downloaded ? colors.successSoft : theme.primarySoft }
                        ]}
                      >
                        {isDownloading ? (
                          <LoadingSpinner size="sm" color={theme.primary} />
                        ) : (
                          <Ionicons 
                            name={downloaded ? "checkmark-circle" : "cloud-download-outline"} 
                            size={24} 
                            color={downloaded ? colors.success : theme.primary} 
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </Card>
                </Animated.View>
              )
            })
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
                      <TouchableOpacity
                        style={[styles.downloadButton, { backgroundColor: colors.infoSoft }]}
                      >
                        <Ionicons
                          name="download-outline"
                          size={24}
                          color={colors.info}
                        />
                      </TouchableOpacity>
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
  moduleNumber: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: {
    fontSize: 20,
    fontWeight: '800',
  },
  moduleInfo: {
    flex: 1,
    gap: 2,
  },
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
