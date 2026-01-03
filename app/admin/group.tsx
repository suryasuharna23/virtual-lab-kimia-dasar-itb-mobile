import React, { useEffect, useState, useCallback, useMemo } from 'react'
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
  ScrollView,
  LayoutAnimation,
  UIManager
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

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminGroupScreen() {
  const { theme } = useTheme()
  
  // Data State
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Action State
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cohort, setCohort] = useState('')
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null)
  const [editId, setEditId] = useState<string | number | null>(null)
  const [visibility, setVisibility] = useState('public')

  // Filter, Sort, & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z'>('newest')

  const fetchGroups = useCallback(async () => {
    try {
      const response = await api.getWithQuery<Group[]>(endpoints.groups.list, {
        page: 1,
        limit: 100,
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

  // --- LOGIC FILTERING & SORTING ---
  const processedGroups = useMemo(() => {
    let result = [...groups];

    // 1. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(lowerQuery) || 
        (g.cohort && g.cohort.toLowerCase().includes(lowerQuery)) ||
        (g.description && g.description.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Filter Visibility
    if (filterType !== 'all') {
      result = result.filter(g => g.visibility === filterType);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortOrder === 'a-z') {
        return a.name.localeCompare(b.name);
      }
      const valA = a.id || 0;
      const valB = b.id || 0;
      
      if (sortOrder === 'oldest') return Number(valA) - Number(valB);
      return Number(valB) - Number(valA); 
    });

    return result;
  }, [groups, searchQuery, filterType, sortOrder]);

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchGroups()
  }, [fetchGroups])

  // --- HANDLERS ---
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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
      await downloadGroup(group.id, group.name, { showShareDialog: true })
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

  // --- UI ACTIONS ---
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

  // --- RENDERERS ---

  const renderHeader = () => (
    <View style={[styles.headerContainer, {
      backgroundColor: theme.primary + '15',
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      marginTop: 8,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{
          backgroundColor: theme.primary,
          borderRadius: 16,
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}>
          <Ionicons name="people" size={28} color={theme.textOnPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', letterSpacing: 0.5, fontSize: 16 }}>
            Kelompok
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 12, fontWeight: '500' }}>
            Kelola pembagian kelompok
          </Text>
        </View>
      </View>
      <Button
        size="sm"
        variant="primary"
        leftIcon={<Ionicons name="add" size={18} color={theme.textOnPrimary} />}
        onPress={openUpload}
        style={{ borderRadius: 20, minWidth: 80, marginLeft: 12, paddingHorizontal: 0 }}
      >
        Baru
      </Button>
    </View>
  )

  const renderSearchAndFilter = () => (
    <View style={{ marginBottom: 16 }}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Cari kelompok..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={(text) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSearchQuery(text);
          }}
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter & Sort Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
        {/* Filter Type */}
        {(['all', 'public', 'private'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFilterType(type);
            }}
            style={[
              styles.chip,
              { 
                backgroundColor: filterType === type ? theme.primary : theme.surface,
                borderColor: filterType === type ? theme.primary : theme.border 
              }
            ]}
          >
            <Text style={{ 
              color: filterType === type ? theme.textOnPrimary : theme.textSecondary, 
              fontSize: 13, fontWeight: '600', capitalize: 'sentences' 
            }}>
              {type === 'all' ? 'Semua' : type === 'public' ? 'Publik' : 'Privat'}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ width: 1, height: 20, backgroundColor: theme.border, alignSelf: 'center', marginHorizontal: 4 }} />

        {/* Sort Toggle */}
        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSortOrder(prev => prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'a-z' : 'newest');
          }}
          style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', alignItems: 'center' }]}
        >
          <Ionicons name={sortOrder === 'newest' ? "arrow-down" : "arrow-up"} size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
            {sortOrder === 'newest' ? 'Terbaru' : sortOrder === 'oldest' ? 'Terlama' : 'A-Z'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )

  const renderItem = ({ item, index }: { item: Group; index: number }) => {
    const isDownloading = downloadingId === item.id

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.surface, borderColor: theme.border }])}>
          <View style={styles.cardContent}>
            {/* Icon */}
            <View style={[styles.groupIconContainer, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="people" size={24} color={theme.primary} />
            </View>

            <View style={styles.groupInfo}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.textPrimary, fontWeight: '700', flex: 1, marginRight: 8 }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                
                {item.visibility !== 'public' && (
                   <View style={{backgroundColor: colors.warning + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4}}>
                      <Text style={{fontSize: 10, color: colors.warning, fontWeight: '700'}}>PRIVAT</Text>
                   </View>
                )}
              </View>

              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                <Text style={{color: theme.primary, fontSize: 11, fontWeight: '600', marginRight: 6}}>
                   {item.cohort || 'Angkatan Umum'}
                </Text>
                <Text style={{color: theme.textMuted, fontSize: 11}}>•</Text>
                <Text style={{color: theme.textSecondary, fontSize: 11, marginLeft: 6, flex: 1}} numberOfLines={1}>
                  {item.description || '-'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                 {item.file_size && (
                   <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Ionicons name="document-attach-outline" size={12} color={theme.textMuted} style={{marginRight: 2}}/>
                      <Text style={{fontSize: 11, color: theme.textMuted}}>
                        {(item.file_size / 1024 / 1024).toFixed(1)} MB
                      </Text>
                   </View>
                 )}
              </View>
            </View>
          </View>

          <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
             <TouchableOpacity 
               onPress={() => handleDownload(item)} 
               disabled={isDownloading}
               style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10}}
             >
                {isDownloading ? <LoadingSpinner size="sm" color={theme.primary}/> : (
                  <>
                    <Ionicons name="download-outline" size={18} color={theme.primary} />
                    <Text style={{marginLeft: 6, fontSize: 13, fontWeight: '600', color: theme.primary}}>Unduh</Text>
                  </>
                )}
             </TouchableOpacity>
             
             <View style={{width: 1, height: '60%', backgroundColor: theme.border}} />

             <TouchableOpacity 
               onPress={() => openEdit(item)} 
               style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10}}
             >
                <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                <Text style={{marginLeft: 6, fontSize: 13, fontWeight: '600', color: theme.textSecondary}}>Edit</Text>
             </TouchableOpacity>
             
             <View style={{width: 1, height: '60%', backgroundColor: theme.border}} />

             <TouchableOpacity 
               onPress={() => handleDelete(item.id)} 
               style={{flex: 0.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10}}
             >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
             </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <FlatList
        data={processedGroups}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSearchAndFilter()}
          </>
        }
        ListEmptyComponent={!loading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.iconCircle, { backgroundColor: theme.border }]}>
                 <Ionicons name="people-outline" size={40} color={theme.textMuted} />
              </View>
              <Text variant="h4" style={{ color: theme.textPrimary, marginTop: 16 }}>Tidak ada kelompok</Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
                {searchQuery ? 'Coba kata kunci lain.' : 'Tap tombol "Baru" untuk menambah data.'}
              </Text>
            </View>
        ) : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Modal Upload/Edit dengan ScrollView */}
      <Modal visible={showUpload} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            {/* Header Modal - Fixed */}
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: theme.textPrimary }}>
                {editId ? 'Edit Kelompok' : 'Upload Kelompok'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Content Scrollable */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>NAMA KELOMPOK</Text>
                <TextInput
                  placeholder="Contoh: Kelompok 1 - Senin"
                  placeholderTextColor={theme.textMuted}
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>COHORT / ANGKATAN</Text>
                <TextInput
                  placeholder="Contoh: 2024/2025"
                  placeholderTextColor={theme.textMuted}
                  value={cohort}
                  onChangeText={setCohort}
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>DESKRIPSI</Text>
                <TextInput
                  placeholder="Deskripsi singkat..."
                  placeholderTextColor={theme.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  style={[styles.input, styles.textArea, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>VISIBILITAS</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setVisibility('public')}
                    style={[styles.visibilityOption, { 
                      backgroundColor: visibility === 'public' ? theme.primary + '10' : theme.background,
                      borderColor: visibility === 'public' ? theme.primary : theme.border 
                    }]}
                  >
                    <Ionicons name="globe-outline" size={18} color={visibility === 'public' ? theme.primary : theme.textSecondary} />
                    <Text style={{ color: visibility === 'public' ? theme.primary : theme.textSecondary, fontWeight: '600', fontSize: 13 }}>Publik</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setVisibility('private')}
                    style={[styles.visibilityOption, { 
                      backgroundColor: visibility === 'private' ? colors.warning + '10' : theme.background,
                      borderColor: visibility === 'private' ? colors.warning : theme.border 
                    }]}
                  >
                    <Ionicons name="lock-closed-outline" size={18} color={visibility === 'private' ? colors.warning : theme.textSecondary} />
                    <Text style={{ color: visibility === 'private' ? colors.warning : theme.textSecondary, fontWeight: '600', fontSize: 13 }}>Privat</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>FILE DATA (PDF)</Text>
                <TouchableOpacity 
                   onPress={pickFile} 
                   style={[styles.filePicker, {borderColor: theme.border, backgroundColor: theme.background}]}
                >
                  <Ionicons name={file ? "document-attach" : "cloud-upload-outline"} size={24} color={theme.primary} />
                  <Text style={{color: theme.textPrimary, marginTop: 4, textAlign: 'center'}}>
                    {file && 'assets' in file && file.assets && file.assets.length > 0
                      ? file.assets[0].name
                      : 'Pilih File Kelompok'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                variant="primary"
                size="lg"
                onPress={editId ? handleEdit : handleUpload}
                loading={uploading}
                style={{ marginTop: 8 }}
              >
                {editId ? 'Simpan' : 'Upload Sekarang'}
              </Button>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    // Inline style match
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    marginLeft: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 4,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: '85%', // Batasi tinggi modal agar terlihat proporsional
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  filePicker: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
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
    marginBottom: 16,
    opacity: 0.5,
  },
})