import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui';
import { Card } from '@/components/ui';

export default function AdminHomeScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text
            variant="h2"
            style={{
              color: theme.primary,
              fontWeight: '900',
              marginBottom: 8,
              letterSpacing: 0.5,
              textAlign: 'center',
              fontSize: 28,
            }}
          >
            Dashboard Asisten/Admin
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              textAlign: 'center',
              marginBottom: 24,
              fontSize: 15,
            }}
          >
            Selamat datang! Kelola fitur-fitur laboratorium dengan mudah dan cepat.
          </Text>
          <View style={styles.menuGrid}>
            <TouchableOpacity activeOpacity={0.85}>
              <Card style={{ ...styles.menuCard, backgroundColor: theme.surface, borderColor: theme.primary + '33' }}>
                <Ionicons name="megaphone" size={36} color={theme.primary} style={{ marginBottom: 10 }} />
                <Text style={{ ...styles.menuText, color: theme.textPrimary }}>Pengumuman</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85}>
              <Card style={{ ...styles.menuCard, backgroundColor: theme.surface, borderColor: theme.primary + '33' }}>
                <Ionicons name="document" size={36} color={theme.primary} style={{ marginBottom: 10 }} />
                <Text style={{ ...styles.menuText, color: theme.textPrimary }}>Modul Praktikum</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85}>
              <Card style={{ ...styles.menuCard, backgroundColor: theme.surface, borderColor: theme.primary + '33' }}>
                <Ionicons name="people" size={36} color={theme.primary} style={{ marginBottom: 10 }} />
                <Text style={{ ...styles.menuText, color: theme.textPrimary }}>Kelompok</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85}>
              <Card style={{ ...styles.menuCard, backgroundColor: theme.surface, borderColor: theme.primary + '33' }}>
                <MaterialCommunityIcons name="clipboard-list-outline" size={36} color={theme.primary} style={{ marginBottom: 10 }} />
                <Text style={{ ...styles.menuText, color: theme.textPrimary }}>Penilaian</Text>
              </Card>
            </TouchableOpacity>
          </View>
          <View style={styles.statsContainer}>
            <View style={{ ...styles.statCard, backgroundColor: theme.primary + '11' }}>
              <Ionicons name="person" size={24} color={theme.primary} />
              <Text style={styles.statValue}>120</Text>
              <Text style={styles.statLabel}>Mahasiswa</Text>
            </View>
            <View style={{ ...styles.statCard, backgroundColor: theme.primary + '11' }}>
              <Ionicons name="flask" size={24} color={theme.primary} />
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Modul</Text>
            </View>
            <View style={{ ...styles.statCard, backgroundColor: theme.primary + '11' }}>
              <Ionicons name="checkmark-done" size={24} color={theme.primary} />
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Selesai</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  menuCard: {
    width: '47%',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 18,
    elevation: 4,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  menuText: {
    marginTop: 8,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 4,
    elevation: 2,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#222',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
