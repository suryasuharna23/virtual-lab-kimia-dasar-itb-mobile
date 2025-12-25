import { Link } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const PRACTICUMS = [
  { id: 'titrasi', title: 'Titrasi Asam-Basa', desc: 'Latihan buret, indikator, pH meter.' },
  { id: 'redoks', title: 'Redoks KMnO4', desc: 'Titrasi pengoksidasi dengan KMnO4.' },
  { id: 'gravimetri', title: 'Gravimetri Sederhana', desc: 'Pengendapan dan penimbangan endapan.' },
  { id: 'buffer', title: 'Kalibrasi Buffer pH', desc: 'Kalibrasi pH meter dengan buffer standar.' },
];

export default function PracticumScreen() {
  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8fafc' }]}> 
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.title}>Practicum</ThemedText>
          <ThemedText style={styles.subtitle}>
            Pilih topik praktikum lalu lanjutkan ke Virtual Lab untuk simulasi alat dan reagen.
          </ThemedText>
          <Link href="/virtual-lab" asChild>
            <Pressable style={styles.cta}>
              <ThemedText style={styles.ctaText}>Buka pemilihan praktikum</ThemedText>
            </Pressable>
          </Link>
        </View>

        <View style={styles.list}>
          {PRACTICUMS.map((p) => (
            <Link key={p.id} href={`/virtual-lab-sim?practicum=${p.id}`} asChild>
              <Pressable style={styles.card}>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{p.title}</ThemedText>
                <ThemedText style={styles.cardDesc}>{p.desc}</ThemedText>
                <ThemedText style={styles.cardLink}>Mulai skenario</ThemedText>
              </Pressable>
            </Link>
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
    gap: 16,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  title: {
    color: '#e2e8f0',
    fontWeight: '800',
  },
  subtitle: {
    color: '#cbd5e1',
  },
  cta: {
    marginTop: 6,
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  ctaText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  cardTitle: {
    color: '#0f172a',
  },
  cardDesc: {
    color: 'rgba(15, 23, 42, 0.7)',
  },
  cardLink: {
    color: '#0ea5e9',
    fontWeight: '700',
    marginTop: 4,
  },
});
