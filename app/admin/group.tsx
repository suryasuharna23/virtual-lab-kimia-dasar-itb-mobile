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
  UIManager,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as DocumentPicker from 'expo-document-picker'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Button, LoadingSpinner, Badge } from '@/components/ui'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import { colors, spacing, borderRadius } from '@/constants/theme'
import type { Group } from '@/types'

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

// Enable LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminGroupScreen() {
  // AMBIL isDark UNTUK PERBAIKAN KONTRAS
  const { theme, isDark } = useTheme()

  // --- STATE ---
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [modalVisible, setModalVisible] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cohort, setCohort] = useState('')
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc') // Default A-Z

  // --- API HANDLERS ---
  const fetchGroups = useCallback(async () => {
    try {
      // Endpoint dummy, sesuaikan dengan endpoint real
      const response = await api.getWithQuery<Group[]>(endpoints.groups.list, {
        page: 1,
        limit: 100,
      })
      if (response.success && response.data) {
        setGroups(response.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const onRefresh = () => {
    setRefreshing(true)
    fetchGroups()
  }

  // --- LOGIC FILTERING & SORTING ---
  const processedGroups = useMemo(() => {
    let result = [...groups];

    // 1. Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name.toLowerCase().includes(lowerQuery) || 
        (g.description && g.description.toLowerCase().includes(lowerQuery))
      );
    }

    // 2. Sorting (Default by Name A-Z)
    result.sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

    return result;
  }, [groups, searchQuery, sortOrder]);

  // --- CRUD HANDLERS ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        })
      }
    } catch (e) {
      console.error('Document picker error:', e)
      Alert.alert('Error', 'Gagal memilih file')
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama kelompok wajib diisi')
      return
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Deskripsi wajib diisi')
      return
    }
    if (!cohort.trim()) {
      Alert.alert('Error', 'Angkatan/Cohort wajib diisi')
      return
    }
    if (!selectedFile) {
      Alert.alert('Error', 'File pembagian kelompok wajib dipilih')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.uploadFile<Group>(
        endpoints.groups.list,
        { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.type },
        { name, description, cohort, visibility: 'public' }
      )
      
      if (response.success) {
        Alert.alert('Sukses', 'Kelompok berhasil dibuat')
        closeModal()
        fetchGroups()
      } else {
        Alert.alert('Error', response.message || 'Gagal membuat kelompok')
      }
    } catch (e: any) {
      console.error('Submit error:', e)
      Alert.alert('Error', e.message || 'Terjadi kesalahan koneksi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama kelompok wajib diisi')
      return
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Deskripsi wajib diisi')
      return
    }
    if (!cohort.trim()) {
      Alert.alert('Error', 'Angkatan/Cohort wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      let response
      
      if (selectedFile) {
        response = await api.uploadFile<Group>(
          `${endpoints.groups.list}/${editGroup?.id}`,
          { uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.type },
          { name, description, cohort, visibility: 'public' },
          'PUT'
        )
      } else {
        response = await api.put(`${endpoints.groups.list}/${editGroup?.id}`, {
          name,
          description,
          cohort,
          visibility: 'public'
        })
      }
      
      if (response.success) {
        Alert.alert('Sukses', 'Kelompok berhasil diupdate')
        closeModal()
        fetchGroups()
      } else {
        Alert.alert('Error', response.message || 'Gagal update kelompok')
      }
    } catch (e: any) {
      console.error('Update error:', e)
      Alert.alert('Error', e.message || 'Terjadi kesalahan koneksi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    Alert.alert('Hapus Kelompok', 'Data anggota di dalamnya mungkin akan terpengaruh.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await api.delete(`${endpoints.groups.list}/${id}`)
            if (response.success) {
              fetchGroups()
            } else {
              Alert.alert('Error', response.message)
            }
          } catch (e) {
            Alert.alert('Error', 'Gagal menghapus')
          }
        }
      }
    ])
  }

  // --- MODAL ACTIONS ---
  const openCreate = () => {
    setEditGroup(null)
    setName('')
    setDescription('')
    setCohort('')
    setSelectedFile(null)
    setModalVisible(true)
  }

  const openEdit = (group: Group) => {
    setEditGroup(group)
    setName(group.name)
    setDescription(group.description || '')
    setCohort(group.cohort || '')
    setSelectedFile(null)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setEditGroup(null)
    setName('')
    setDescription('')
    setCohort('')
    setSelectedFile(null)
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
            Pembagian Kelompok
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 12, fontWeight: '500' }}>
            Atur pembagian kelompok
          </Text>
        </View>
      </View>
      
      {/* BUTTON BARU: Fix Contrast */}
      <Button
        size="sm"
        variant="primary"
        iconName="add"
        onPress={openCreate}
        style={{ borderRadius: 20, minWidth: 80, marginLeft: 12, paddingHorizontal: 0 }}
        textColor={isDark ? '#000000' : theme.textOnPrimary}
      >
        Baru
      </Button>
    </View>
  );

  const renderSearchAndFilter = () => (
    <View style={{ marginBottom: 16 }}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Cari nama kelompok..."
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
        
        {/* Contoh Filter "Semua" (Meskipun di Group biasanya cuma Semua, tapi disiapkan untuk konsistensi) */}
        <Button
          size="sm"
          variant="primary" 
          onPress={() => {}} // No-op jika cuma ada satu filter
          style={{ 
            borderWidth: 1,
            borderColor: theme.primary,
            backgroundColor: theme.primary,
            height: 36,
          }}
          // Fix Contrast: Tombol aktif di Dark Mode
          textColor={isDark ? '#000000' : undefined}
        >
          Semua
        </Button>

        <View style={{ width: 1, height: 20, backgroundColor: theme.border, alignSelf: 'center', marginHorizontal: 4 }} />

        {/* Sort Toggle */}
        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
          }}
          style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', alignItems: 'center' }]}
        >
          <Ionicons 
            name={sortOrder === 'asc' ? "arrow-down" : "arrow-up"} // Icon sort A-Z
            size={14} 
            color={theme.textSecondary} 
            style={{ marginRight: 6 }} 
          />
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
            {sortOrder === 'asc' ? 'Nama (A-Z)' : 'Nama (Z-A)'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item, index }: { item: Group; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.surface, borderColor: theme.border }])}>
        <View style={styles.cardContent}>
           {/* Icon Circle */}
           <View style={[styles.iconContainer, { backgroundColor: theme.primary + '10' }]}>
              <Ionicons name="people-outline" size={24} color={theme.primary} />
            </View>

            <View style={styles.contentInfo}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.textPrimary, fontWeight: '700', flex: 1 }}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              <Text variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                {item.description || 'Tidak ada deskripsi'}
              </Text>
            </View>
        </View>

        {/* Action Bar */}
        <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
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
  );

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
            <Text variant="h4" style={{ color: theme.textPrimary, marginTop: 16 }}>Belum ada kelompok</Text>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
              Buat kelompok baru untuk memulai.
            </Text>
          </View>
        ) : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL FORM */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}> 
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: theme.textPrimary }}>
                {editGroup ? 'Edit Kelompok' : 'Buat Kelompok'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>NAMA KELOMPOK</Text>
                <TextInput
                  placeholder="Contoh: Pembagian Kelompok Praktikum Kimia Dasar"
                  placeholderTextColor={theme.textMuted}
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>DESKRIPSI</Text>
                <TextInput
                  placeholder="Contoh: Pembagian untuk semester ganjil 2024/2025"
                  placeholderTextColor={theme.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>ANGKATAN / COHORT</Text>
                <TextInput
                  placeholder="Contoh: 2024"
                  placeholderTextColor={theme.textMuted}
                  value={cohort}
                  onChangeText={setCohort}
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: theme.textSecondary}]}>FILE PEMBAGIAN KELOMPOK</Text>
                <TouchableOpacity
                  onPress={pickDocument}
                  disabled={submitting}
                  style={[
                    styles.filePickerButton,
                    { 
                      borderColor: theme.border, 
                      backgroundColor: theme.background,
                      opacity: submitting ? 0.6 : 1 
                    }
                  ]}
                >
                  <Ionicons name="document-attach" size={20} color={theme.primary} />
                  <Text style={{ color: theme.primary, fontWeight: '600', marginLeft: 8 }}>
                    {selectedFile ? 'Ganti File' : 'Pilih File (PDF/Excel/Word)'}
                  </Text>
                </TouchableOpacity>

                {selectedFile && (
                  <View style={[styles.selectedFileContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Ionicons name="document" size={18} color={theme.primary} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      {selectedFile.size && (
                        <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                          {formatFileSize(selectedFile.size)}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => setSelectedFile(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Ionicons name="close-circle" size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}

                {editGroup && !selectedFile && editGroup.storage_path && (
                  <View style={[styles.selectedFileContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Ionicons name="document-text" size={18} color={theme.success} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '500' }}>
                        File sudah ada
                      </Text>
                      <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                        Pilih file baru untuk mengganti
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <Button 
                variant="primary" 
                size="lg"
                onPress={editGroup ? handleUpdate : handleSubmit} 
                loading={submitting}
                style={{ marginTop: 8 }}
                textColor={isDark ? '#000000' : undefined}
              >
                {editGroup ? 'Simpan Perubahan' : 'Buat Kelompok'}
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
    // Styles handled inline
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
  // Card Styles
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  // Empty State
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
  // Modal Styles
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
    paddingBottom: 40,
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
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
  },
});