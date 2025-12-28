import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button } from '@/components/ui';

export default function AdminAnnouncementScreen() {
  const { theme } = useTheme();
  // TODO: fetch, create, edit, delete announcement logic
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>
          Pengumuman Praktikum
        </Text>
        <Button variant="primary" leftIcon={<Ionicons name="add" size={20} color={theme.textOnPrimary} />} style={{ marginBottom: 16 }}>Buat Pengumuman</Button>
        {/* TODO: List announcements, edit, delete, label penting */}
        <Card style={{ ...styles.announcementCard, borderColor: theme.border, backgroundColor: theme.surface }}> 
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert" size={20} color="#E53935" style={{ marginRight: 8 }} />
            <Text style={{ color: '#E53935', fontWeight: '700', fontSize: 13 }}>Penting</Text>
          </View>
          <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 16, marginTop: 8 }}>Jadwal Praktikum Minggu Ini</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Praktikum dimulai pukul 08.00 di Lab Kimia Dasar. Harap hadir tepat waktu.</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity><Ionicons name="create" size={18} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="trash" size={18} color="#E53935" /></TouchableOpacity>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  announcementCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 14,
  },
});
