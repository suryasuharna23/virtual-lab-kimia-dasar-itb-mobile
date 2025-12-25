import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { useRouter } from 'expo-router'

import {
  Text,
  Card,
  LoadingSpinner,
  Button,
} from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import {
  getOfflineFiles,
  deleteOfflineFile,
  clearAllOfflineFiles,
  getOfflineStorageSize,
  formatFileSize,
  getFileIcon,
} from '@/lib/storage'
import type { OfflineFile } from '@/types'
import { layout, spacing, colors, shadows, borderRadius } from '@/constants/theme'

export default function OfflineFilesScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [files, setFiles] = useState<OfflineFile[]>([])
  const [totalSize, setTotalSize] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [fetchedFiles, size] = await Promise.all([
        getOfflineFiles(),
        getOfflineStorageSize(),
      ])
      
      // Sort files by type, then by name
      const sortedFiles = fetchedFiles.sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type)
        return a.name.localeCompare(b.name)
      })

      setFiles(sortedFiles)
      setTotalSize(size)
    } catch (error) {
      console.error('Error loading offline files:', error)
      Toast.show({
        type: 'error',
        text1: 'Gagal memuat data',
        text2: 'Terjadi kesalahan saat memuat file offline',
      })
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    loadData()
  }, [loadData])

  const confirmDeleteFile = (file: OfflineFile) => {
    Alert.alert(
      'Hapus File',
      `Apakah Anda yakin ingin menghapus "${file.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => handleDeleteFile(file.id),
        },
      ]
    )
  }

  const handleDeleteFile = async (id: string) => {
    try {
      const success = await deleteOfflineFile(id)
      if (success) {
        setFiles((prev) => prev.filter((f) => f.id !== id))
        // Recalculate size roughly or fetch again
        const newSize = await getOfflineStorageSize()
        setTotalSize(newSize)
        
        Toast.show({
          type: 'success',
          text1: 'File dihapus',
          text2: 'File berhasil dihapus dari penyimpanan offline',
        })
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gagal menghapus',
        text2: 'Tidak dapat menghapus file saat ini',
      })
    }
  }

  const confirmDeleteAll = () => {
    if (files.length === 0) return

    Alert.alert(
      'Hapus Semua File',
      'Tindakan ini akan menghapus semua file yang tersimpan offline. Anda harus mengunduhnya lagi jika ingin mengaksesnya tanpa internet.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: handleClearAll,
        },
      ]
    )
  }

  const handleClearAll = async () => {
    try {
      const success = await clearAllOfflineFiles()
      if (success) {
        setFiles([])
        setTotalSize(0)
        Toast.show({
          type: 'success',
          text1: 'Penyimpanan dibersihkan',
          text2: 'Semua file offline telah dihapus',
        })
      } else {
        throw new Error('Failed to clear')
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gagal membersihkan',
        text2: 'Terjadi kesalahan saat menghapus semua file',
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch (e) {
      return dateString
    }
  }

  const getTypeLabel = (type: OfflineFile['type']) => {
    switch (type) {
      case 'module': return 'Modul'
      case 'file': return 'File'
      case 'nilai': return 'Nilai'
      case 'group': return 'Grup'
      default: return type
    }
  }

  const renderItem = ({ item }: { item: OfflineFile }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primarySoft }]}>
          <Ionicons 
            name={getFileIcon(item.name) as any} 
            size={24} 
            color={theme.primary} 
          />
        </View>
        
        <View style={styles.fileInfo}>
          <View style={styles.titleRow}>
            <Text 
              variant="body" 
              weight="semibold" 
              style={{ color: theme.textPrimary, flex: 1 }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text variant="caption" style={{ color: theme.textSecondary }}>
              {getTypeLabel(item.type)} • {formatFileSize(item.size)}
            </Text>
            <Text variant="caption" style={{ color: theme.textMuted }}>
              {formatDate(item.downloadedAt)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => confirmDeleteFile(item)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Card>
  )

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <LoadingSpinner size="lg" color={theme.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView 
      edges={['top']} 
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text variant="h2" style={{ color: theme.textPrimary }}>
              File Offline
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary }}>
              Menggunakan {formatFileSize(totalSize)}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={files}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
              <Ionicons
                name="cloud-offline-outline"
                size={64}
                color={theme.textMuted}
              />
            </View>
            <Text variant="h4" style={{ color: theme.textPrimary, marginTop: spacing.lg }}>
              Belum ada file offline
            </Text>
            <Text 
              variant="body" 
              style={{ 
                color: theme.textSecondary, 
                textAlign: 'center',
                marginTop: spacing.sm,
                maxWidth: '70%'
              }}
            >
              Unduh modul atau file untuk akses offline
            </Text>
          </View>
        }
      />

      {files.length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <Button
            variant="ghost"
            fullWidth
            onPress={confirmDeleteAll}
            style={styles.dangerButton}
            leftIcon={<Ionicons name="trash" size={20} color={colors.error} />}
          >
            <Text style={{ color: colors.error, fontWeight: '600' }}>
              Hapus Semua
            </Text>
          </Button>
        </View>
      )}
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
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  listContent: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: 100, // Space for footer
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['4xl'],
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.xl, // Safe area for iPhone X+
    borderTopWidth: 1,
    ...shadows.lg,
  },
  dangerButton: {
    borderColor: colors.error + '40', // 40% opacity
    backgroundColor: colors.error + '10', // 10% opacity
  }
})
