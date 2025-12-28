import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Button } from '@/components/ui';

export default function AdminGroupScreen() {
  const { theme } = useTheme();
  // TODO: fetch, upload, edit, delete, download group logic
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>
          Kelompok Praktikum
        </Text>
        <Button variant="primary" leftIcon={<Ionicons name="add" size={20} color={theme.textOnPrimary} />} style={{ marginBottom: 16 }}>Upload Kelompok PDF</Button>
        {/* TODO: List groups, edit, delete, label visibilitas, download */}
        <Card style={{ ...styles.groupCard, borderColor: theme.border, backgroundColor: theme.surface }}> 
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Kelompok A</Text>
            <View style={styles.visibilityBadge}><Text style={styles.visibilityText}>Publik</Text></View>
          </View>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>File: kelompok_a.pdf</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity><Ionicons name="download" size={18} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="create" size={18} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity><Ionicons name="trash" size={18} color="#EF4444" /></TouchableOpacity>
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
    backgroundColor: '#F3F4F6',
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 14,
  },
  visibilityBadge: {
    marginLeft: 10,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  visibilityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3730A3',
    letterSpacing: 0.2,
  },
});
