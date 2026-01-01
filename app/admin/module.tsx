import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Button, LoadingSpinner, Badge } from '@/components/ui'
import { api } from '@/lib/api'
import { endpoints, API_BASE_URL } from '@/constants/api'
import { downloadModule } from '@/lib/download'
import { colors, spacing, borderRadius } from '@/constants/theme'
import type { Module } from '@/types'

export default function AdminModuleScreen() {
  const { theme } = useTheme()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null)
  const [editId, setEditId] = useState<string | number | null>(null)
  const [visibility, setVisibility] = useState('public')

  const fetchModules = useCallback(async () => {
    try {
      setError('')
      const response = await api.getWithQuery<Module[]>(endpoints.modules.list, {
        page: 1,
        limit: 50,
      })
      if (response.success && response.data) {
        setModules(response.data)
      } else {
        setError(response.message || 'Gagal mengambil data modul')
      }
    } catch (e) {
      setError('Gagal mengambil data modul')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchModules()
  }, [fetchModules])

  const handleUpload = async () => {
    if (!title || !description || !file) {
      Alert.alert('Error', 'Judul, deskripsi, dan file wajib diisi')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('visibility', visibility)
      if (file && 'assets' in file && file.assets && file.assets.length > 0) {
        const pickedFile = file.assets[0]
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as unknown as Blob)
      }

      const response = await fetch(`${API_BASE_URL}${endpoints.modules.list}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await api.getAuthToken?.()}`,
        },
        body: formData,
      })
      const json = await response.json()

      if (json.success) {
        Alert.alert('Sukses', 'Modul berhasil diupload')
        closeModal()
        fetchModules()
      } else {
        Alert.alert('Error', json.message || 'Gagal upload modul')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal upload modul')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Judul dan deskripsi wajib diisi')
      return
    }
    setUploading(true)
    try {
      const response = await api.put(endpoints.modules.get(editId!), {
        title,
        description,
        visibility,
      })
      if (response.success) {
        Alert.alert('Sukses', 'Modul berhasil diedit')
        closeModal()
        fetchModules()
      } else {
        Alert.alert('Error', response.message || 'Gagal edit modul')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal edit modul')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    Alert.alert('Konfirmasi', 'Yakin ingin menghapus modul ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await api.delete(endpoints.modules.get(id))
            if (response.success) {
              Alert.alert('Sukses', 'Modul berhasil dihapus')
              fetchModules()
            } else {
              Alert.alert('Error', response.message || 'Gagal hapus modul')
            }
          } catch (e) {
            Alert.alert('Error', 'Gagal hapus modul')
          }
        },
      },
    ])
  }

  const handleDownload = async (module: Module) => {
    try {
      setDownloadingId(module.id)
      const localUri = await downloadModule(module.id, module.title, {
        showShareDialog: true,
      })
      if (localUri) {
        Alert.alert('Berhasil', 'File berhasil didownload dan dibagikan')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal download modul')
    } finally {
      setDownloadingId(null)
    }
  }

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFile(result)
    }
  }

  const openEdit = (modul: Module) => {
    setEditId(modul.id)
    setTitle(modul.title)
    setDescription(modul.description || '')
    setVisibility(modul.visibility || 'public')
    setFile(null)
    setShowUpload(true)
  }

  const openUpload = () => {
    setEditId(null)
    setTitle('')
    setDescription('')
    setVisibility('public')
    setFile(null)
    setShowUpload(true)
  }

  const closeModal = () => {
    setShowUpload(false)
    setEditId(null)
    setTitle('')
    setDescription('')
    setVisibility('public')
    setFile(null)
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
          Modul Praktikum
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
          Kelola modul pembelajaran praktikan
        </Text>
      </View>
      <Button
        size="sm"
        variant="primary"
        leftIcon={<Ionicons name="add" size={18} color={theme.textOnPrimary} />}
        onPress={openUpload}
        style={{ borderRadius: 20, paddingHorizontal: 16 }}
      >
        Baru
      </Button>
    </View>
  )

  const renderError = () => {
    if (!error) return null
    return (
      <View style={[styles.errorBanner, { backgroundColor: theme.errorSoft }]}>
        <Ionicons name="warning-outline" size={20} color={colors.error} />
        <Text style={{ color: colors.error, flex: 1, marginLeft: 8 }}>{error}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    )
  }

  const renderItem = ({ item, index }: { item: Module; index: number }) => {
    const isDownloading = downloadingId === item.id

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.surface, borderColor: theme.border }])}>
          <View style={styles.cardContent}>
            <View
              style={[
                styles.moduleNumber,
                { backgroundColor: index % 2 === 0 ? theme.primarySoft : colors.accentSoft },
              ]}
            >
              <Ionicons
                name="document-text"
                size={24}
                color={index % 2 === 0 ? theme.primary : colors.accent}
              />
            </View>

            <View style={styles.moduleInfo}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.textPrimary, fontWeight: '700' }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text variant="caption" style={{ color: theme.textSecondary }} numberOfLines={2}>
                {item.description || 'Tidak ada deskripsi'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                <Badge
                  variant={item.visibility === 'public' ? 'success' : 'warning'}
                  size="sm"
                >
                  {item.visibility === 'public' ? 'Publik' : 'Privat'}
                </Badge>
                {item.file_size && (
                  <Badge variant="info" size="sm">
                    {(item.file_size / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                )}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleDownload(item)}
                disabled={isDownloading}
                style={[styles.actionButton, { backgroundColor: theme.primarySoft }]}
              >
                {isDownloading ? (
                  <LoadingSpinner size="sm" color={theme.primary} />
                ) : (
                  <Ionicons name="download-outline" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openEdit(item)}
                style={[styles.actionButton, { backgroundColor: colors.infoSoft }]}
              >
                <Ionicons name="create-outline" size={20} color={colors.info} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={[styles.actionButton, { backgroundColor: colors.errorSoft }]}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </Animated.View>
    )
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.iconCircle, { backgroundColor: theme.border }]}>
        <Ionicons name="document-text-outline" size={40} color={theme.textMuted} />
      </View>
      <Text variant="h4" style={{ color: theme.textPrimary, marginTop: 16 }}>
        Belum ada modul
      </Text>
      <Text
        style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: '80%' }}
      >
        Tap tombol "Baru" di atas untuk menambahkan modul praktikum.
      </Text>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <LoadingSpinner size="lg" color={theme.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <FlatList
        data={modules}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<>{renderHeader()}{renderError()}</>}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showUpload} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: theme.textPrimary }}>
                {editId ? 'Edit Modul' : 'Upload Modul Baru'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>JUDUL</Text>
              <TextInput
                placeholder="Contoh: Modul 1 - Pengenalan Lab"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>DESKRIPSI</Text>
              <TextInput
                placeholder="Deskripsi singkat modul..."
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                  { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>VISIBILITAS</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setVisibility('public')}
                  style={[
                    styles.visibilityOption,
                    {
                      backgroundColor: visibility === 'public' ? theme.primarySoft : theme.background,
                      borderColor: visibility === 'public' ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={visibility === 'public' ? theme.primary : theme.textSecondary}
                  />
                  <Text
                    style={{
                      color: visibility === 'public' ? theme.primary : theme.textSecondary,
                      fontWeight: '600',
                    }}
                  >
                    Publik
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setVisibility('private')}
                  style={[
                    styles.visibilityOption,
                    {
                      backgroundColor: visibility === 'private' ? colors.warningSoft : theme.background,
                      borderColor: visibility === 'private' ? colors.warning : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={visibility === 'private' ? colors.warning : theme.textSecondary}
                  />
                  <Text
                    style={{
                      color: visibility === 'private' ? colors.warning : theme.textSecondary,
                      fontWeight: '600',
                    }}
                  >
                    Privat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {!editId && (
              <View style={styles.formGroup}>
                <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>FILE PDF</Text>
                <Button variant="secondary" onPress={pickFile} style={{ marginBottom: 0 }}>
                  {file && 'assets' in file && file.assets && file.assets.length > 0
                    ? `📄 ${file.assets[0].name}`
                    : '📁 Pilih File PDF'}
                </Button>
              </View>
            )}

            <Button
              variant="primary"
              size="lg"
              onPress={editId ? handleEdit : handleUpload}
              loading={uploading}
              style={{ marginTop: 16 }}
            >
              {editId ? 'Simpan Perubahan' : 'Upload Modul'}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
    flex: 1,
    gap: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
})
