import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.5:5001/api/modules';

type Module = {
  id: string;
  title: string;
  description: string;
  visibility: string;
};

export default function AdminModuleScreen() {
  const { theme } = useTheme();
  const auth = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [editId, setEditId] = useState(null);
  const [visibility, setVisibility] = useState('public');

  const cardStyle = (overrides: Partial<any> = {}) => ({
    ...styles.moduleCard,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    ...overrides,
  });

  // Fetch modules
  const fetchModules = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      console.log('TOKEN:', token);
      if (!token) {
        setError('Token tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}?page=1&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const text = await res.text();
      console.log('API response:', text);
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        setError('Response bukan JSON: ' + text);
        setLoading(false);
        return;
      }
      if (json.success) {
        setModules(json.data);
      } else {
        setError(json.message || 'Gagal mengambil data modul');
      }
    } catch (e) {
      setError('Gagal mengambil data modul');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Upload module
  const handleUpload = async () => {
    if (!title || !description || !file) {
      Alert.alert('Error', 'Judul, deskripsi, dan file wajib diisi');
      return;
    }
    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('visibility', visibility);
      if (file && 'assets' in file && file.assets && file.assets.length > 0) {
        const pickedFile = file.assets[0];
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as any);
      }
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Sukses', 'Modul berhasil diupload');
        setShowUpload(false);
        setTitle('');
        setDescription('');
        setFile(null);
        fetchModules();
      } else {
        Alert.alert('Error', json.message || 'Gagal upload modul');
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal upload modul');
    }
    setUploading(false);
  };

  // Edit module
  const handleEdit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Judul dan deskripsi wajib diisi');
      return;
    }
    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const res = await fetch(`${API_URL}/${editId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, visibility }),
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert('Sukses', 'Modul berhasil diedit');
        setShowUpload(false);
        setTitle('');
        setDescription('');
        setEditId(null);
        fetchModules();
      } else {
        Alert.alert('Error', json.message || 'Gagal edit modul');
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal edit modul');
    }
    setUploading(false);
  };

  // Delete module
  const handleDelete = async (id: string) => {
    Alert.alert('Konfirmasi', 'Yakin ingin menghapus modul?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync('auth_token');
            const res = await fetch(`${API_URL}/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
              Alert.alert('Sukses', 'Modul dihapus');
              fetchModules();
            } else {
              Alert.alert('Error', json.message || 'Gagal hapus modul');
            }
          } catch (e) {
            Alert.alert('Error', 'Gagal hapus modul');
          }
        }
      }
    ]);
  };

  // Download module
  const handleDownload = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}/download`);
      const text = await res.text();
      console.log('[DOWNLOAD] Response:', text);
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        Alert.alert('Error', 'Response bukan JSON: ' + text);
        return;
      }
      if (json.success && json.data.download_url) {
        // Open download URL (expo-linking or WebBrowser)
        Alert.alert('Download', 'Link download siap dibuka');
        // Linking.openURL(json.data.download_url); // Uncomment jika pakai expo-linking
      } else {
        Alert.alert('Error', json.message || 'Gagal mendapatkan link download');
      }
    } catch (e) {
      console.log('[DOWNLOAD] Error:', e);
      Alert.alert('Error', 'Gagal download modul');
    }
  };

  // Pick file
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFile(result);
    }
  };

  // Open edit modal
  const openEdit = (modul: any) => {
    setEditId(modul.id);
    setTitle(modul.title);
    setDescription(modul.description);
    setVisibility(modul.visibility);
    setShowUpload(true);
  };

  // Open upload modal
  const openUpload = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setVisibility('public');
    setFile(null);
    setShowUpload(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>
          Modul Praktikum
        </Text>

        <Button variant="primary" leftIcon={<Ionicons name="add" size={20} color={theme.textOnPrimary} />} style={{ marginBottom: 16 }} onPress={openUpload}>
          Upload Modul PDF
        </Button>

        {loading ? <ActivityIndicator size="large" color={theme.primary} /> : null}
        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}

        <FlatList
          data={modules}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={cardStyle()}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="document" size={20} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>{item.title}</Text>
              </View>
              <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Deskripsi: {item.description}</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 2 }}>Visibility: {item.visibility}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={{ marginRight: 18 }} onPress={() => handleDownload(item.id)}>
                  <Ionicons name="download" size={18} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginRight: 18 }} onPress={() => openEdit(item)}>
                  <Ionicons name="create" size={18} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={18} color={'#FF3B30'} />
                </TouchableOpacity>
              </View>
            </Card>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>Belum ada modul</Text>}
        />

        {/* Modal Upload/Edit */}
        <Modal visible={showUpload} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: theme.surface, padding: 24, borderRadius: 16, width: '90%' }}>
              <Text variant="h3" style={{ marginBottom: 12 }}>{editId ? 'Edit Modul' : 'Upload Modul Baru'}</Text>
              <TextInput
                placeholder="Judul Modul"
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 8, marginBottom: 10 }}
              />
              <TextInput
                placeholder="Deskripsi Modul"
                value={description}
                onChangeText={setDescription}
                style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 8, marginBottom: 10 }}
              />
              <TextInput
                placeholder="Visibility (public/private)"
                value={visibility}
                onChangeText={setVisibility}
                style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 8, marginBottom: 10 }}
              />
              {!editId && (
                <Button variant="secondary" style={{ marginBottom: 10 }} onPress={pickFile}>
                  {file && 'assets' in file && file.assets && file.assets.length > 0 ? `File: ${file.assets[0].name}` : 'Pilih File PDF'}
                </Button>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button variant="secondary" style={{ marginRight: 8 }} onPress={() => setShowUpload(false)}>Batal</Button>
                <Button variant="primary" loading={uploading} onPress={editId ? handleEdit : handleUpload}>
                  {editId ? 'Simpan Perubahan' : 'Upload'}
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  moduleCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
});
