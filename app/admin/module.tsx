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
import { endpoints } from '@/constants/api'
import { downloadModule } from '@/lib/download'
import { colors, spacing, borderRadius } from '@/constants/theme'
import type { Module } from '@/types'

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminModuleScreen() {
  // AMBIL isDark UNTUK FIX CONTRAST
  const { theme, isDark } = useTheme()
  
  // Data State
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  
  // Action State
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null)
  
  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null)
  const [editId, setEditId] = useState<string | number | null>(null)
  const [visibility, setVisibility] = useState('public')

  // Filter, Sort, & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z'>('newest')

  const fetchModules = useCallback(async () => {
    try {
      setError('')
      const response = await api.getWithQuery<Module[]>(endpoints.modules.list, {
        page: 1,
        limit: 100,
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

  // --- LOGIC FILTERING & SORTING ---
  const processedModules = useMemo(() => {
    let result = [...modules];

    // 1. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(lowerQuery) || 
        (m.description && m.description.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Filter Visibility
    if (filterType !== 'all') {
      result = result.filter(m => m.visibility === filterType);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortOrder === 'a-z') {
        return a.title.localeCompare(b.title);
      }
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      
      if (sortOrder === 'oldest') return dateA - dateB;
      return dateB - dateA; // newest default
    });

    return result;
  }, [modules, searchQuery, filterType, sortOrder]);

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchModules()
  }, [fetchModules])

  // --- HANDLERS ---
  const handleUpload = async () => {
    if (!title || !description || !file) {
      Alert.alert('Error', 'Judul, deskripsi, dan file wajib diisi')
      return
    }
    
    if (!('assets' in file) || !file.assets || file.assets.length === 0) {
      Alert.alert('Error', 'File tidak valid, silakan pilih ulang')
      return
    }
    
    setUploading(true)
    try {
      const pickedFile = file.assets[0]
      
      const response = await api.uploadFile<Module>(
        endpoints.modules.list,
        {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        },
        {
          title,
          description,
          visibility,
        }
      )

      if (response.success) {
        Alert.alert('Sukses', 'Modul berhasil diupload')
        closeModal()
        fetchModules()
      } else {
        Alert.alert('Error', response.message || 'Gagal upload modul')
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal upload modul')
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
      await downloadModule(module.id, module.title, { showShareDialog: true })
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
        <View style={{ flex: 1 }}>
          <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', letterSpacing: 0.5, fontSize: 16 }}>
            Modul Praktikum
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 12, fontWeight: '500' }}>
            Kelola materi pembelajaran
          </Text>
        </View>
      </View>
      {/* UPDATE BUTTON BARU: Pakai iconName & textColor */}
      <Button
        size="sm"
        variant="primary"
        iconName="add"
        onPress={openUpload}
        style={{ borderRadius: 20, minWidth: 80, marginLeft: 12, paddingHorizontal: 0 }}
        textColor={isDark ? '#000000' : theme.textOnPrimary}
      >
        Baru
      </Button>
    </View>
  );

  const renderSearchAndFilter = () => (
    <View style={{ marginBottom: 16 }}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Cari modul..."
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
        
        {/* IMPLEMENTASI BUTTON FILTER YANG DIPERBAIKI */}
        {(['all', 'public', 'private'] as const).map((type) => (
          <Button
            key={type}
            size="sm"
            variant={filterType === type ? 'primary' : 'ghost'}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFilterType(type);
            }}
            style={{ 
              borderWidth: 1,
              borderColor: filterType === type ? theme.primary : theme.border,
              backgroundColor: filterType === type ? theme.primary : theme.surface,
              height: 36,
              // minWidth: 0, // Reset jika Button punya default minWidth
            }}
            // Force text black jika Dark Mode & Selected
            textColor={filterType === type && isDark ? '#000000' : undefined}
          >
             {type === 'all' ? 'Semua' : type === 'public' ? 'Publik' : 'Privat'}
          </Button>
        ))}

        <View style={{ width: 1, height: 20, backgroundColor: theme.border, alignSelf: 'center', marginHorizontal: 4 }} />

        {/* Sort Toggle (Bisa tetap TouchableOpacity atau Button, kita samakan style chipnya) */}
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

  const renderItem = ({ item, index }: { item: Module; index: number }) => {
    const isDownloading = downloadingId === item.id

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.surface, borderColor: theme.border }])}>
          <View style={styles.cardContent}>
            {/* Icon */}
            <View style={[styles.moduleIconContainer, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="document-text" size={24} color={theme.primary} />
            </View>

            <View style={styles.moduleInfo}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.textPrimary, fontWeight: '700', flex: 1, marginRight: 8 }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                
                {item.visibility !== 'public' && (
                   <View style={{backgroundColor: colors.warning + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4}}>
                      <Text style={{fontSize: 10, color: colors.warning, fontWeight: '700'}}>PRIVAT</Text>
                   </View>
                )}
              </View>

              <Text variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }} numberOfLines={2}>
                {item.description || 'Tidak ada deskripsi'}
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                 {item.file_size && (
                   <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Ionicons name="server-outline" size={12} color={theme.textMuted} style={{marginRight: 2}}/>
                      <Text style={{fontSize: 11, color: theme.textMuted}}>
                        {(item.file_size / 1024 / 1024).toFixed(1)} MB
                      </Text>
                   </View>
                 )}
              </View>
            </View>
          </View>
          
          {/* Action Bar */}
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
        data={processedModules}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSearchAndFilter()}
            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.error + '10' }]}>
                 <Text style={{color: colors.error}}>{error}</Text>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={!loading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.iconCircle, { backgroundColor: theme.border }]}>
                 <Ionicons name="document-text-outline" size={40} color={theme.textMuted} />
              </View>
              <Text variant="h4" style={{ color: theme.textPrimary, marginTop: 16 }}>Tidak ada modul</Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
                {searchQuery ? 'Coba kata kunci lain.' : 'Tap tombol "Baru" untuk menambah modul.'}
              </Text>
            </View>
        ) : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Modal Upload/Edit */}
      <Modal visible={showUpload} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: theme.textPrimary }}>
                {editId ? 'Edit Modul' : 'Upload Modul'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, {color: theme.textSecondary}]}>JUDUL MODUL</Text>
              <TextInput
                placeholder="Contoh: Modul 1 - Pengenalan"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
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

            {!editId && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>FILE DOKUMEN</Text>
                <TouchableOpacity 
                   onPress={pickFile} 
                   style={[styles.filePicker, {borderColor: theme.border, backgroundColor: theme.background}]}
                >
                  <Ionicons name={file ? "document-attach" : "cloud-upload-outline"} size={24} color={theme.primary} />
                  <Text style={{color: theme.textPrimary, marginTop: 4, textAlign: 'center'}}>
                    {file && 'assets' in file && file.assets && file.assets.length > 0
                      ? file.assets[0].name
                      : 'Pilih File PDF'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Button
              variant="primary"
              size="lg"
              onPress={editId ? handleEdit : handleUpload}
              loading={uploading}
              style={{ marginTop: 8 }}
              // Kontras aman untuk tombol utama modal
              textColor={isDark ? '#000000' : undefined}
            >
              {editId ? 'Simpan' : 'Upload Sekarang'}
            </Button>
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
    // Styles handled inline to match announcement header
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
    marginLeft: 8, // Tambahan spacing agar tidak nempel icon
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
  moduleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleInfo: {
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
    fontSize: 12, // Disesuaikan dengan style index
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
    minHeight: 120, // Disesuaikan dengan style index
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
  errorBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  }
})