import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AboutLabScreen() {
  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8fafc' }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>About Lab</ThemedText>
        <ThemedText style={styles.subtitle}>
          Laboratorium Kimia Dasar ITB versi virtual: panduan, keamanan, dan kontak tim.
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Tujuan</ThemedText>
          <ThemedText style={styles.body}>
            Mendukung mahasiswa memahami alur praktikum, penataan alat, dan prosedur keamanan sebelum sesi luring.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Keamanan</ThemedText>
          <ThemedText style={styles.body}>
            Gunakan APD (sarung tangan, kacamata), jauhkan sumber api dari pelarut mudah terbakar, dan ikuti panduan SDS reagen.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Kontak</ThemedText>
          <ThemedText style={styles.body}>Email: labkimdas@itb.ac.id</ThemedText>
          <ThemedText style={styles.body}>Asisten: 08:00 - 16:00 WIB</ThemedText>
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
    gap: 12,
  },
  title: {
    color: '#0f172a',
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(15, 23, 42, 0.65)',
  },
  section: {
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
    gap: 6,
  },
  sectionTitle: {
    color: '#0f172a',
  },
  body: {
    color: 'rgba(15, 23, 42, 0.7)',
  },
});
