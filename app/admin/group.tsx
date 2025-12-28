import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button } from '@/components/ui';

export default function AdminGroupScreen() {
  const { theme } = useTheme();
  const cardStyle = (overrides: Partial<any> = {}) => ({
    ...styles.groupCard,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    ...overrides,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>
          Kelompok Praktikum
        </Text>

        <Button variant="primary" leftIcon={<Ionicons name="add" size={20} color={theme.textOnPrimary} />} style={{ marginBottom: 16 }}>
          Upload Kelompok PDF
        </Button>

        <Card style={cardStyle()}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Kelompok A</Text>
            <View style={[styles.visibilityBadge, { backgroundColor: theme.primarySoft ?? '#E0E7FF' }]}>
              <Text style={[styles.visibilityText, { color: theme.primary ?? '#3730A3' }]}>Publik</Text>
            </View>
          </View>

          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>File: kelompok_a.pdf</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={{ marginRight: 18 }}><Ionicons name="download" size={18} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity style={{ marginRight: 18 }}><Ionicons name="create" size={18} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="trash" size={18} color={(theme as any).error ?? '#EF4444'} /></TouchableOpacity>
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
  groupCard: {
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
  visibilityBadge: {
    marginLeft: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  visibilityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
