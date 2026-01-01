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
import { downloadGroup } from '@/lib/download'
import { colors, spacing, borderRadius } from '@/constants/theme'
import type { Group } from '@/types'

export default function AdminGroupScreen() {
  const { theme } = useTheme()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cohort, setCohort] = useState('')
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null)
  const [editId, setEditId] = useState<string | number | null>(null)
  const [visibility, setVisibility] = useState('public')

  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.getWithQuery<Group[]>(endpoints.groups.list, {
        page: 1,
        limit: 50,
      })
      if (response.success && response.data) {
        setGroups(response.data)
      }
    } catch (e) {
      console.error('Failed to fetch groups:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchGroups()
  }, [fetchGroups])

  const handleUpload = async () => {
    if (!name || !description || !cohort || !file) {
      Alert.alert('Error', 'Semua field wajib diisi')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('cohort', cohort)
      formData.append('visibility', visibility)
      if (file && 'assets' in file && file.assets && file.assets.length > 0) {
        const pickedFile = file.assets[0]
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as unknown as Blob)
      }

      const token = await api.getAuthToken()
      const response = await fetch(`${API_BASE_URL}${endpoints.groups.list}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      const json = await response.json()

      if (json.success) {
        Alert.alert('Sukses', 'Kelompok berhasil diupload')
        closeModal()
        fetchGroups()
      } else {
        Alert.alert('Error', json.message || 'Gagal upload kelompok')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal upload kelompok')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async () => {
    if (!name || !description || !cohort) {
      Alert.alert('Error', 'Nama, deskripsi, dan cohort wajib diisi')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('cohort', cohort)
      formData.append('visibility', visibility)

      if (file && 'assets' in file && file.assets && file.assets.length > 0) {
        const pickedFile = file.assets[0]
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as unknown as Blob)
      }

      const token = await api.getAuthToken()
      const response = await fetch(`${API_BASE_URL}${endpoints.groups.get(editId!)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      const json = await response.json()

      if (json.success) {
        Alert.alert('Sukses', 'Kelompok berhasil diupdate')
        closeModal()
        fetchGroups()
      } else {
        Alert.alert('Error', json.message || 'Gagal update kelompok')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal update kelompok')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    Alert.alert('Konfirmasi', 'Yakin ingin menghapus kelompok ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await api.delete(endpoints.groups.get(id))
            if (response.success) {
              Alert.alert('Sukses', 'Kelompok berhasil dihapus')
              fetchGroups()
            } else {
              Alert.alert('Error', response.message || 'Gagal hapus kelompok')
            }
          } catch (e) {
            Alert.alert('Error', 'Gagal hapus kelompok')
          }
        },
      },
    ])
  }

  const handleDownload = async (group: Group) => {
    try {
      setDownloadingId(group.id)
      const localUri = await downloadGroup(group.id, group.name, {
        showShareDialog: true,
      })
      if (localUri) {
        Alert.alert('Berhasil', 'File berhasil didownload dan dibagikan')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal download file kelompok')
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

  const openEdit = (group: Group) => {
    setEditId(group.id)
    setName(group.name)
    setDescription(group.description || '')
    setCohort(group.cohort || '')
    setVisibility(group.visibility || 'public')
    setFile(null)
    setShowUpload(true)
  }

  const openUpload = () => {
    setEditId(null)
    setName('')
    setDescription('')
    setCohort('')
    setVisibility('public')
    setFile(null)
    setShowUpload(true)
  }

  const closeModal = () => {
    setShowUpload(false)
    setEditId(null)
    setName('')
    setDescription('')
    setCohort('')
    setVisibility('public')
    setFile(null)
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
          Kelompok Praktikum
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
          Kelola pembagian kelompok praktikan
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

  const renderItem = ({ item, index }: { item: Group; index: number }) => {
    const isDownloading = downloadingId === item.id

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.surface, borderColor: theme.border }])}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.infoSoft }]}>
              <Ionicons name="people" size={24} color={colors.info} />
            </View>

            <View style={styles.groupInfo}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.textPrimary, fontWeight: '700' }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text variant="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
                {item.cohort || 'Umum'}
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
        <Ionicons name="people-outline" size={40} color={theme.textMuted} />
      </View>
      <Text variant="h4" style={{ color: theme.textPrimary, marginTop: 16 }}>
        Belum ada kelompok
      </Text>
      <Text
        style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: '80%' }}
      >
        Tap tombol "Baru" di atas untuk menambahkan data kelompok.
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
        data={groups}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
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
                {editId ? 'Edit Kelompok' : 'Upload Kelompok Baru'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>NAMA KELOMPOK</Text>
              <TextInput
                placeholder="Contoh: Kelompok 1 - Senin Pagi"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>DESKRIPSI</Text>
              <TextInput
                placeholder="Deskripsi singkat..."
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
              <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>COHORT / ANGKATAN</Text>
              <TextInput
                placeholder="Contoh: 2024/2025"
                placeholderTextColor={theme.textMuted}
                value={cohort}
                onChangeText={setCohort}
                style={[
                  styles.input,
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

            <View style={styles.formGroup}>
              <Text style={{ color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600' }}>FILE PDF</Text>
              <Button variant="secondary" onPress={pickFile} style={{ marginBottom: 0 }}>
                {file && 'assets' in file && file.assets && file.assets.length > 0
                  ? `📄 ${file.assets[0].name}`
                  : '📁 Pilih File PDF'}
              </Button>
            </View>

            <Button
              variant="primary"
              size="lg"
              onPress={editId ? handleEdit : handleUpload}
              loading={uploading}
              style={{ marginTop: 16 }}
            >
              {editId ? 'Simpan Perubahan' : 'Upload Kelompok'}
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
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
    maxHeight: '90%',
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
