import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Practicum = {
  id: 'titrasi' | 'redoks' | 'gravimetri' | 'buffer';
  title: string;
  desc: string;
  accent: string;
};

const PRACTICUMS: Practicum[] = [
  {
    id: 'titrasi',
    title: 'Titrasi Asam-Basa',
    desc: 'Praktikum titrasi untuk menentukan konsentrasi larutan',
    accent: '#3b82f6',
  },
  {
    id: 'redoks',
    title: 'Reaksi Redoks',
    desc: 'Praktikum reaksi oksidasi dan reduksi',
    accent: '#ef4444',
  },
  {
    id: 'gravimetri',
    title: 'Analisis Gravimetri',
    desc: 'Praktikum analisis berdasarkan massa',
    accent: '#f59e0b',
  },
  {
    id: 'buffer',
    title: 'Larutan Buffer',
    desc: 'Praktikum pembuatan dan pengujian larutan penyangga',
    accent: '#22c55e',
  },
];

export default function VirtualLabScreen() {
  const router = useRouter();

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8fafc' }]}> 
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <ThemedText style={styles.heroBadgeText}>Laboratorium Kimia Dasar ITB</ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>Virtual Lab</ThemedText>
          <ThemedText style={styles.subtitle}>
            Pilih praktikum, lalu lanjut ke simulasi dengan preset alat dan reagen sesuai skenario.
          </ThemedText>
          <View style={styles.heroActions}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/virtual-lab-sim?practicum=titrasi')}>
              <ThemedText style={styles.primaryButtonText}>Mulai dengan titrasi</ThemedText>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => router.push('/virtual-lab-sim')}>
              <ThemedText style={styles.ghostButtonText}>Lewati pemilihan</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.practicumHeader}>
          <ThemedText type="subtitle" style={styles.workspaceTitle}>Pilih Praktikum</ThemedText>
          <ThemedText style={styles.legendHint}>Tap salah satu kartu untuk memuat setup awal.</ThemedText>
        </View>
        <View style={styles.practicumGrid}>
          {PRACTICUMS.map((p) => {
            return (
              <Pressable
                key={p.id}
                style={styles.practicumCard}
                onPress={() => router.push(`/virtual-lab-sim?practicum=${p.id}`)}>
                <View style={[styles.practicumPill, { backgroundColor: `${p.accent}22` }]}> 
                  <ThemedText style={[styles.practicumPillText, { color: p.accent }]}>
                    {p.title.split(' ')[0]}
                  </ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.practicumTitle}>{p.title}</ThemedText>
                <ThemedText style={styles.cardDesc}>{p.desc}</ThemedText>
                <ThemedText style={styles.cardLink}>Muat skenario</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={styles.selectionHint}>
          Setelah memilih, Anda akan diarahkan ke halaman simulasi dengan preset sesuai praktikum.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    padding: 20,
    gap: 18,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.2)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  heroBadgeText: {
    color: '#2dd4bf',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  ghostButtonText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  subtitle: {
    color: '#e2e8f0',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  legendChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  legendChipText: {
    fontWeight: '700',
  },
  legendHint: {
    color: 'rgba(15, 23, 42, 0.65)',
  },
  workspaceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  workspaceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workspaceTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  workspaceMeta: {
    color: 'rgba(15, 23, 42, 0.55)',
  },
  practicumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  practicumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  practicumCard: {
    flexBasis: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    gap: 6,
  },
  practicumTitle: {
    fontSize: 16,
    color: '#0f172a',
  },
  practicumPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  practicumPillText: {
    fontWeight: '700',
  },
  selectionBadge: {
    marginTop: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  cardDesc: {
    color: 'rgba(15, 23, 42, 0.75)',
  },
  cardLink: {
    color: '#0ea5e9',
    fontWeight: '700',
  },
  selectionHint: {
    marginTop: 8,
    color: 'rgba(15, 23, 42, 0.65)',
  },
});
