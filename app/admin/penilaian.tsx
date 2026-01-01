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
  Switch,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Button, LoadingSpinner, Badge } from '@/components/ui'
import { api } from '@/lib/api'
import { endpoints, API_BASE_URL } from '@/constants/api'
import { downloadNilai, shareFile } from '@/lib/download'
import { colors, spacing, borderRadius } from '@/constants/theme'
import type { NilaiFile } from '@/types'

export default function AdminPenilaianScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [nilaiFiles, setNilaiFiles] = useState<NilaiFile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)
  const [className, setClassName] = useState('')
  const [cohort, setCohort] = useState('')
  const [password, setPassword] = useState('')
  const [hasPassword, setHasPassword] = useState(false)
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null)
  const [editId, setEditId] = useState<string | number | null>(null)

  const fetchNilaiFiles = useCallback(async () => {
    try {
      setError('')
      const response = await api.getWithQuery<NilaiFile[]>(endpoints.nilai.list, {
        page: 1,
        limit: 50,
      })
      if (response.success && response.data) {
        setNilaiFiles(response.data)
      } else {
        setError(response.message || 'Gagal mengambil data nilai')
      }
    } catch (e) {
      setError('Gagal mengambil data nilai')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchNilaiFiles()
  }, [fetchNilaiFiles])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchNilaiFiles()
  }, [fetchNilaiFiles])

  const handleUpload = async () => {
    if (!className || !cohort || !file) {
      Alert.alert('Error', 'Kelas, angkatan, dan file wajib diisi')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('class', className)
      formData.append('cohort', cohort)
      if (hasPassword && password) {
        formData.append('password', password)
      }
      if (file && 'assets' in file && file.assets && file.assets.length > 0) {
        const pickedFile = file.assets[0]
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as unknown as Blob)
      }

      const response = await fetch(`${API_BASE_URL}${endpoints.nilai.list}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await api.getAuthToken?.()}`,
        },
        body: formData,
      })
      const json = await response.json()

      if (json.success) {
        Alert.alert('Sukses', 'File nilai berhasil diupload')
        closeModal()
        fetchNilaiFiles()
      } else {
        Alert.alert('Error', json.message || 'Gagal upload file nilai')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal upload file nilai')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async () => {
    if (!className || !cohort) {
      Alert.alert('Error', 'Kelas dan angkatan wajib diisi')
      return
    }
    setUploading(true)
    try {
      const updateData: Record<string, string | boolean | null> = {
        class: className,
        cohort: cohort,
      }
      
      if (hasPassword && password) {
        updateData.password = password
      } else if (!hasPassword) {
        updateData.password = ''
      }

      const response = await api.put(endpoints.nilai.get(editId!), updateData)
      if (response.success) {
        Alert.alert('Sukses', 'File nilai berhasil diedit')
        closeModal()
        fetchNilaiFiles()
      } else {
        Alert.alert('Error', response.message || 'Gagal edit file nilai')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal edit file nilai')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    Alert.alert('Konfirmasi', 'Yakin ingin menghapus file nilai ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await api.delete(endpoints.nilai.get(id))
            if (response.success) {
              Alert.alert('Sukses', 'File nilai berhasil dihapus')
              fetchNilaiFiles()
            } else {
              Alert.alert('Error', response.message || 'Gagal hapus file nilai')
            }
          } catch (e) {
            Alert.alert('Error', 'Gagal hapus file nilai')
          }
        },
      },
    ])
  }

  const handleDownload = async (nilai: NilaiFile) => {
    try {
      setDownloadingId(nilai.id)
      const fileName = `Nilai_${nilai.class}_${nilai.cohort}`
      const localUri = await downloadNilai(nilai.id, fileName, {
        showShareDialog: true,
      })
      if (localUri) {
        Alert.alert('Berhasil', 'File berhasil didownload dan dibagikan')
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal download file nilai')
    } finally {
      setDownloadingId(null)
    }
  }

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ 
      type: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFile(result)
    }
  }

  const openEdit = (nilai: NilaiFile) => {
    setEditId(nilai.id)
    setClassName(nilai.class)
    setCohort(nilai.cohort)
    setHasPassword(nilai.has_password)
    setPassword('')
    setFile(null)
    setShowUpload(true)
  }

  const openUpload = () => {
    setEditId(null)
    setClassName('')
    setCohort('')
    setHasPassword(false)
    setPassword('')
    setFile(null)
    setShowUpload(true)
  }

  const closeModal = () => {
    setShowUpload(false)
    setEditId(null)
    setClassName('')
    setCohort('')
    setHasPassword(false)
    setPassword('')
    setFile(null)
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
          Penilaian
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
          Kelola file nilai praktikum
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

  const renderItem = ({ item, index }: { item: NilaiFile; index: number }) => {
    const isDownloading = downloadingId === item.id

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.surface, borderColor: theme.border }])}>
          <View style={styles.cardContent}>
            <View
              style={[
                styles.nilaiIcon,
                { backgroundColor: index % 2 === 0 ? theme.primarySoft : colors.accentSoft },
              ]}
            >
              <Ionicons
                name="school"
                size={24}
                color={index % 2 === 0 ? theme.primary : colors.accent}
              />
            </View>

            <View style={styles.nilaiInfo}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.textPrimary, fontWeight: '700' }}
                numberOfLines={1}
              >
                {item.class}
              </Text>
              <Text variant="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
                Angkatan {item.cohort}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                <Badge
                  variant={item.has_password ? 'warning' : 'success'}
                  size="sm"
                >
                  {item.has_password ? 'Dilindungi' : 'Publik'}
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
        <Ionicons name="school-outline" size={40} color={theme.textMuted} />
      </View>
      <Text variant="h4" style={{ color: theme.textPrimary, marginTop: 16 }}>
        Belum ada file nilai
      </Text>
      <Text
        style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: '80%' }}
      >
        Tap tombol "Baru" di atas untuk menambahkan file nilai praktikum.
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
        data={nilaiFiles}
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
                {editId ? 'Edit File Nilai' : 'Upload File Nilai Baru'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>KELAS</Text>
              <TextInput
                placeholder="Contoh: TPB A, KIM-01"
                placeholderTextColor={theme.textMuted}
                value={className}
                onChangeText={setClassName}
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>ANGKATAN</Text>
              <TextInput
                placeholder="Contoh: 2024, 2025"
                placeholderTextColor={theme.textMuted}
                value={cohort}
                onChangeText={setCohort}
                keyboardType="numeric"
                style={[
                  styles.input,
                  { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                ]}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.label}>PROTEKSI PASSWORD</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {hasPassword ? 'File dilindungi password' : 'File dapat diakses publik'}
                  </Text>
                </View>
                <Switch
                  value={hasPassword}
                  onValueChange={setHasPassword}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={hasPassword ? colors.white : theme.textMuted}
                />
              </View>
            </View>

            {hasPassword && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  placeholder={editId ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={[
                    styles.input,
                    { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background },
                  ]}
                />
              </View>
            )}

            {!editId && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>FILE</Text>
                <Button variant="secondary" onPress={pickFile} style={{ marginBottom: 0 }}>
                  {file && 'assets' in file && file.assets && file.assets.length > 0
                    ? `${file.assets[0].name}`
                    : 'Pilih File (PDF/Excel)'}
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
              {editId ? 'Simpan Perubahan' : 'Upload File Nilai'}
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
    paddingBottom: 40,
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
  nilaiIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nilaiInfo: {
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
  label: {
    color: '#6B7280',
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
})
