import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert, 
  Switch, 
  FlatList, 
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView // Ditambahkan
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button, LoadingSpinner, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import { endpoints } from '@/constants/api';
import type { Announcement } from '@/types';

// Helper format tanggal
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Baru saja';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
};

export default function AdminAnnouncementScreen() {
  const { theme } = useTheme();

  // --- STATE UTAMA ---
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);

  // --- STATE LOADING ---
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- STATE DATA ---
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // --- STATE FILTER, SORT, SEARCH (BARU) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'important'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); 

  // --- EFFECT DEBOUNCE SEARCH ---
  // Mencegah spam request API saat mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // Delay 500ms
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- API HANDLERS ---

  const fetchAnnouncements = useCallback(async () => {
    try {
      const queryParams: any = { 
        page: 1, 
        limit: 20,
        search: debouncedSearch // keyword pencarian
      };
      if (filterType === 'important') {
        queryParams.is_important = true;
      }
      // Always fetch without sort, sort client-side for full control
      const response = await api.getWithQuery<Announcement[]>(endpoints.announcements.list, queryParams);
      if (response.success) {
        let sorted = [...response.data];
        sorted.sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at || 0).getTime();
          const dateB = new Date(b.published_at || b.created_at || 0).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        setAnnouncements(sorted);
      }
    } catch (e) {
      console.error("Fetch error", e);
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, filterType, sortOrder]);

  // Panggil fetch awal dan setiap kali filter berubah
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Form Belum Lengkap', 'Mohon isi judul dan konten pengumuman.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        title,
        content,
        is_important: isImportant,
      };

      const response = await api.post<Announcement>(endpoints.announcements.list, payload);
      if (response.success) {
        setModalVisible(false);
        resetForm();
        fetchAnnouncements();
        Alert.alert('Berhasil', 'Pengumuman telah dipublikasikan.');
      } else {
        Alert.alert('Gagal', response.message || 'Gagal membuat pengumuman.');
      }
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Announcement) => {
    setEditAnnouncement(item);
    setTitle(item.title);
    setContent(item.content);
    setIsImportant(!!item.is_important);
    setModalVisible(true);
  };

  const handleDelete = async (id: string | number) => {
    Alert.alert('Hapus Pengumuman', 'Yakin ingin menghapus pengumuman ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            const response = await api.delete(`${endpoints.announcements.list}/${id}`);
            if (response.success) {
              fetchAnnouncements();
              Alert.alert('Berhasil', 'Pengumuman dihapus.');
            } else {
              Alert.alert('Gagal', response.message || 'Gagal menghapus pengumuman.');
            }
          } catch (e) {
            Alert.alert('Error', 'Terjadi kesalahan koneksi.');
          }
        }
      }
    ]);
  };

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Form Belum Lengkap', 'Mohon isi judul dan konten pengumuman.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        title,
        content,
        is_important: isImportant,
      };
      const response = await api.put(`${endpoints.announcements.list}/${editAnnouncement?.id}`, payload);
      if (response.success) {
        setModalVisible(false);
        resetForm();
        setEditAnnouncement(null);
        fetchAnnouncements();
        Alert.alert('Berhasil', 'Pengumuman berhasil diupdate.');
      } else {
        Alert.alert('Gagal', response.message || 'Gagal update pengumuman.');
      }
    } catch (e) {
      Alert.alert('Error', 'Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsImportant(false);
  };

  // --- RENDERERS ---

  const renderHeader = () => (
    <View style={[styles.headerContainer, {
      backgroundColor: theme.primary + '15',
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16, // Dikurangi agar tidak terlalu jauh dari search bar
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
          <Ionicons name="megaphone" size={28} color={theme.textOnPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', letterSpacing: 0.5, fontSize: 16 }}>
            Pengumuman
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 12, fontWeight: '500' }}>
            Kelola informasi untuk praktikan
          </Text>
        </View>
      </View>
      <Button
        size="sm"
        variant="primary"
        leftIcon={<Ionicons name="add" size={18} color={theme.textOnPrimary} />}
        onPress={() => setModalVisible(true)}
        style={{ borderRadius: 20, minWidth: 80, marginLeft: 12, paddingHorizontal: 0 }}
      >
        Baru
      </Button>
    </View>
  );

  // --- RENDER SEARCH & FILTER (BARU) ---
  const renderSearchAndFilter = () => (
    <View style={{ marginBottom: 16 }}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Cari judul/konten..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips & Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {/* Filter: Semua */}
        <TouchableOpacity
          onPress={() => setFilterType('all')}
          style={[
            styles.chip, 
            { backgroundColor: filterType === 'all' ? theme.primary : theme.surface, borderColor: theme.border }
          ]}
        >
          <Text style={{ color: filterType === 'all' ? theme.textOnPrimary : theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
            Semua
          </Text>
        </TouchableOpacity>

        {/* Filter: Penting */}
        <TouchableOpacity
          onPress={() => setFilterType('important')}
          style={[
            styles.chip, 
            { backgroundColor: filterType === 'important' ? theme.primary : theme.surface, borderColor: theme.border }
          ]}
        >
          <Text style={{ color: filterType === 'important' ? theme.textOnPrimary : theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
            Penting
          </Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={{ width: 1, height: '60%', backgroundColor: theme.border, alignSelf: 'center', marginHorizontal: 4 }} />

        {/* Sort Toggle */}
        <TouchableOpacity
          onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border, flexDirection: 'row', alignItems: 'center' }]}
        >
          <Ionicons 
            name={sortOrder === 'desc' ? "arrow-down" : "arrow-up"} 
            size={14} 
            color={theme.textSecondary} 
            style={{ marginRight: 6 }} 
          />
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
            {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: { item: Announcement }) => (
    <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.surface, borderColor: theme.border }])}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {item.is_important && (
            <Badge variant="warning" size="sm">PENTING</Badge>
          )}
          <Text variant="caption" style={{ color: theme.textMuted }}>
            {formatDate(item.published_at)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => handleEdit(item)} hitSlop={10}>
            <Ionicons name="create-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={10}>
            <Ionicons name="trash-outline" size={20} color={'#EF4444'} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.cardContent, { color: theme.textSecondary }]} numberOfLines={3}>
        {item.content.replace(/<[^>]+>/g, '')}
      </Text>
      {item.attachments && item.attachments.length > 0 && (
        <View style={[styles.cardFooter, { backgroundColor: theme.background }]}>
          <Ionicons name="document-text-outline" size={16} color={theme.primary} />
          <Text variant="caption" style={{ color: theme.primary, fontWeight: '600', marginLeft: 6 }}>
            {item.attachments.length} Lampiran tersedia
          </Text>
        </View>
      )}
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.iconCircle, { backgroundColor: theme.border }]}>
        <Ionicons name="search-outline" size={40} color={theme.textMuted} />
      </View>
      <Text variant="h4" style={{ color: theme.textPrimary, marginTop: 16 }}>Tidak ada pengumuman</Text>
      <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: '80%' }}>
        {searchQuery ? 'Coba ubah kata kunci pencarian atau filter Anda.' : 'Tap tombol "Baru" untuk membuat pengumuman.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      
      {/* Main List */}
      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        
        // Header Gabungan (Judul + Search/Filter)
        ListHeaderComponent={
          <View>
            {renderHeader()}
            {renderSearchAndFilter()}
          </View>
        }
        
        ListEmptyComponent={!loadingList ? renderEmpty : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        ListFooterComponent={
          loadingList && !refreshing ? (
            <View style={{ padding: 20 }}>
              <LoadingSpinner size="lg" color={theme.primary} />
            </View>
          ) : <View style={{ height: 20 }} />
        }
      />

      {/* Modal Create/Edit */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setEditAnnouncement(null);
          resetForm();
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}> 
            <View style={styles.modalHeader}>
              <Text variant="h3" style={{ color: theme.textPrimary }}>{editAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman'}</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setEditAnnouncement(null);
                resetForm();
              }}>
                <Ionicons name="close-circle" size={28} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={{color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600'}}>JUDUL</Text>
              <TextInput
                placeholder="Contoh: Perubahan Jadwal Praktikum"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={{color: theme.textSecondary, marginBottom: 6, fontSize: 12, fontWeight: '600'}}>ISI PENGUMUMAN</Text>
              <TextInput
                placeholder="Tulis informasi detail di sini..."
                placeholderTextColor={theme.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                style={[styles.input, styles.textArea, { borderColor: theme.border, color: theme.textPrimary, backgroundColor: theme.background }]}
              />
            </View>
            <View style={[styles.switchContainer, { backgroundColor: theme.background, borderColor: theme.border }]}> 
              <View style={{flex: 1}}>
                <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Tandai Penting</Text>
                <Text variant="caption" style={{ color: theme.textSecondary }}>Akan muncul highlight merah</Text>
              </View>
              <Switch 
                value={isImportant} 
                onValueChange={setIsImportant} 
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
            <Button 
              variant="primary" 
              size="lg"
              onPress={editAnnouncement ? handleUpdate : handleSubmit} 
              loading={submitting}
              style={{ marginTop: 8 }}
            >
              {editAnnouncement ? 'Update Pengumuman' : 'Kirim Pengumuman'}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    // Styles handled inline
  },
  // --- STYLES BARU (SEARCH & FILTER) ---
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
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 4,
  },
  // --- END STYLES BARU ---
  card: {
    padding: 0,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
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
    elevation: 20,
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
});