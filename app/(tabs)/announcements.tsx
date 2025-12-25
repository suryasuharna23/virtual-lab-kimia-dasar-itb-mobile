import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const ITEMS = [
  { title: 'Jadwal praktikum minggu depan', detail: 'Titrasi asam-basa akan dimulai Senin 08:00 di Virtual Lab.' },
  { title: 'Pemeliharaan alat', detail: 'pH meter dikalibrasi ulang, gunakan buffer baru bila perlu.' },
  { title: 'Keamanan', detail: 'Gunakan sarung tangan untuk reagen korosif (NaOH, HCl).' },
];

export default function AnnouncementsScreen() {
  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8fafc' }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>Announcements</ThemedText>
        <ThemedText style={styles.subtitle}>Info terbaru seputar praktikum dan peralatan.</ThemedText>
        <View style={styles.list}>
          {ITEMS.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.cardDetail}>{item.detail}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  title: {
    color: '#0f172a',
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(15, 23, 42, 0.65)',
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  cardTitle: {
    color: '#0f172a',
  },
  cardDetail: {
    color: 'rgba(15, 23, 42, 0.7)',
  },
});
