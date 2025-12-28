import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui';
import { Card } from '@/components/ui';

export default function AdminHomeScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, letterSpacing: 0.5, textAlign: 'center' }}>
          Dashboard Asisten/Admin
        </Text>
        <View style={styles.menuRow}>
          <Card style={{ ...styles.menuCard, backgroundColor: theme.surface, borderColor: theme.border }}> 
            <Ionicons name="megaphone" size={32} color={theme.primary} style={{ marginBottom: 8 }} />
            <Text style={{ ...styles.menuText, color: theme.textPrimary }}>Pengumuman</Text>
          </Card>
          <Card style={{ ...styles.menuCard, backgroundColor: theme.surface, borderColor: theme.border }}> 
            <Ionicons name="document" size={32} color={theme.primary} style={{ marginBottom: 8 }} />
            <Text style={{ ...styles.menuText, color: theme.textPrimary }}>Modul Praktikum</Text>
          </Card>
          <Card style={{ ...styles.menuCard, backgroundColor: theme.surface, borderColor: theme.border }}> 
            <Ionicons name="people" size={32} color={theme.primary} style={{ marginBottom: 8 }} />
            <Text style={{ ...styles.menuText, color: theme.textPrimary }}>Kelompok</Text>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  menuCard: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 6,
    elevation: 3,
    borderWidth: 1,
  },
  menuText: {
    marginTop: 10,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
