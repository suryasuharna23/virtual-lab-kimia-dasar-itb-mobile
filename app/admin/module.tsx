import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button } from '@/components/ui';

export default function AdminModuleScreen() {
  const { theme } = useTheme();
  const cardStyle = (overrides: Partial<any> = {}) => ({
    ...styles.moduleCard,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    ...overrides,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>
          Modul Praktikum
        </Text>

        <Button variant="primary" leftIcon={<Ionicons name="add" size={20} color={theme.textOnPrimary} />} style={{ marginBottom: 16 }}>
          Upload Modul PDF
        </Button>

        <Card style={cardStyle()}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="document" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Modul Praktikum 1</Text>
          </View>

          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Judul: Titrasi Asam Basa</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={{ marginRight: 18 }}><Ionicons name="download" size={18} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity style={{ marginRight: 18 }}><Ionicons name="create" size={18} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="trash" size={18} color={'#FF3B30'} /></TouchableOpacity>
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
