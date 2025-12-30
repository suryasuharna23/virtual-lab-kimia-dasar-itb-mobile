import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button } from '@/components/ui';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Pastikan IP ini benar
const API_URL = 'http://192.168.1.5:5001/api/groups';

type Group = {
  id: string;
  name: string;
  description: string;
  cohort: string;
  visibility: string;
  storage_path: string;
  file_size: number;
  file_type: string;
};

export default function AdminGroupScreen() {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State UI
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cohort, setCohort] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState('public');

  const cardStyle = (overrides: Partial<any> = {}) => ({
    ...styles.groupCard,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    ...overrides,
  });

  // --- HELPER: GET SAFE DIRECTORY ---
  // Fungsi ini mencoba mencari direktori yang valid, atau menebak path Android jika undefined
  const getSafeDirectory = () => {
    // 1. Coba ambil dari properti resmi
    const fs = FileSystem as any;
    if (fs.documentDirectory) return fs.documentDirectory;
    if (fs.cacheDirectory) return fs.cacheDirectory;

    // 2. Fallback Khusus Android (Manual Path)
    // Jika Expo Go: host.exp.exponent
    // Jika App Standalone: nama.package.anda
    if (Platform.OS === 'android') {
      // Kita coba path default Expo Go dulu, ini biasanya berhasil untuk testing
      return 'file:///data/user/0/host.exp.exponent/cache/';
    }

    return null;
  };

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const res = await fetch(`${API_URL}?page=1&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const text = await res.text();
      const json = JSON.parse(text);
      if (json.success) setGroups(json.data);
      else setError(json.message);
    } catch {
      setError('Gagal mengambil data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleUpload = async () => {
    if (!name || !description || !cohort || !file) {
      Alert.alert('Error', 'Data tidak lengkap');
      return;
    }
    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('cohort', cohort);
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setShowUpload(false);
        resetForm();
        fetchGroups();
        Alert.alert('Sukses', 'Berhasil upload');
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'Gagal upload');
    }
    setUploading(false);
  };

  const handleEdit = async () => {
    setUploading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('cohort', cohort);
      formData.append('visibility', visibility);
      
      if (file && 'assets' in file && file.assets && file.assets.length > 0) {
        const pickedFile = file.assets[0];
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as any);
      }
      const res = await fetch(`${API_URL}/${editId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setShowUpload(false);
        resetForm();
        fetchGroups();
        Alert.alert('Sukses', 'Berhasil update');
      } else {
        Alert.alert('Error', json.message);
      }
    } catch {
      Alert.alert('Error', 'Gagal update');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Konfirmasi', 'Hapus?', [
      { text: 'Batal' },
      { text: 'Hapus', onPress: async () => {
          const token = await SecureStore.getItemAsync('auth_token');
          await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          fetchGroups();
      }}
    ]);
  };

  // --- DOWNLOAD FUNCTION (FIXED FOR UNDEFINED CONSTANTS) ---
  const handleDownload = async (id: string, groupName: string) => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const sanitizedName = groupName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${sanitizedName}.pdf`;

      // 1. Dapatkan Directory (Pakai Helper)
      let baseDir = getSafeDirectory();

      if (!baseDir) {
        Alert.alert('Critical Error', 'FileSystem tidak terdeteksi. Silakan rebuild aplikasi (npx expo run:android).');
        setLoading(false);
        return;
      }

      console.log('Menggunakan path:', baseDir); // Debugging
      
      const fileUri = baseDir + fileName;
      const url = `${API_URL}/${id}/download`;

      // 2. Download File
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const downloadResult = await downloadResumable.downloadAsync();

      if (!downloadResult || downloadResult.status !== 200) {
        Alert.alert('Error', 'Gagal download dari server.');
        setLoading(false);
        return;
      }

      // 3. Simpan / Share
      if (Platform.OS === 'android') {
        const fs = FileSystem as any;
        const SAF = fs.StorageAccessFramework;

        // Cek apakah SAF tersedia (karena di log kamu SAF hilang)
        if (SAF) {
          try {
            const permissions = await SAF.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
                encoding: fs.EncodingType ? fs.EncodingType.Base64 : 'base64',
              });
              const createdUri = await SAF.createFileAsync(permissions.directoryUri, fileName, 'application/pdf');
              await FileSystem.writeAsStringAsync(createdUri, base64, {
                encoding: fs.EncodingType ? fs.EncodingType.Base64 : 'base64',
              });
              Alert.alert('Berhasil', 'File disimpan!');
            }
          } catch (e) {
            // Fallback ke Share jika SAF gagal/crash
            await Sharing.shareAsync(downloadResult.uri, { mimeType: 'application/pdf', dialogTitle: fileName });
          }
        } else {
          // Jika SAF undefined (kasus kamu), langsung pakai Share
          console.log('SAF tidak ditemukan, fallback ke Share');
          await Sharing.shareAsync(downloadResult.uri, { mimeType: 'application/pdf', dialogTitle: fileName });
        }
      } else {
        // iOS
        await Sharing.shareAsync(downloadResult.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      }

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Terjadi kesalahan saat download.');
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) setFile(result);
  };

  const resetForm = () => {
    setEditId(null); setName(''); setDescription(''); setCohort(''); setFile(null); setVisibility('public');
  };

  const openEdit = (group: Group) => {
    setEditId(group.id); setName(group.name); setDescription(group.description); setCohort(group.cohort); setVisibility(group.visibility); setFile(null); setShowUpload(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, textAlign: 'center' }}>
          Kelompok Praktikum
        </Text>

        <Button variant="primary" leftIcon={<Ionicons name="add" size={20} color="white" />} onPress={() => { resetForm(); setShowUpload(true); }}>
          Upload Kelompok PDF
        </Button>

        {loading && <ActivityIndicator size="large" color={theme.primary} />}

        <Modal visible={showUpload} animationType="slide" transparent onRequestClose={() => setShowUpload(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text variant="h3" style={{ marginBottom: 12 }}>{editId ? 'Edit' : 'Upload'} Kelompok</Text>
              <TextInput placeholder="Nama" value={name} onChangeText={setName} style={styles.input} />
              <TextInput placeholder="Deskripsi" value={description} onChangeText={setDescription} style={styles.input} />
              <TextInput placeholder="Cohort" value={cohort} onChangeText={setCohort} style={styles.input} />
              <Button variant="secondary" onPress={pickFile} style={{ marginBottom: 10 }}>
                {file ? (file.assets ? file.assets[0].name : 'File terpilih') : 'Pilih File PDF'}
              </Button>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onPress={() => setShowUpload(false)} style={{ marginRight: 8 }}>Batal</Button>
                <Button variant="primary" loading={uploading} onPress={editId ? handleEdit : handleUpload}>{editId ? 'Simpan' : 'Upload'}</Button>
              </View>
            </View>
          </View>
        </Modal>

        {groups.map(group => (
          <Card key={group.id} style={cardStyle()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontWeight: '700', color: theme.primary }}>{group.name}</Text>
            </View>
            <Text style={{ marginTop: 4 }}>File: {group.storage_path?.split('/').pop()}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={{ marginRight: 18 }} onPress={() => handleDownload(group.id, group.name)}>
                <Ionicons name="download" size={18} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginRight: 18 }} onPress={() => openEdit(group)}>
                <Ionicons name="create" size={18} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(group.id)}>
                <Ionicons name="trash" size={18} color="red" />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  groupCard: { marginTop: 18, padding: 18, borderRadius: 16, elevation: 2, borderWidth: 1 },
  actionRow: { flexDirection: 'row', marginTop: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 24, borderRadius: 16, width: '90%', elevation: 5 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 15, paddingVertical: 8 }
});