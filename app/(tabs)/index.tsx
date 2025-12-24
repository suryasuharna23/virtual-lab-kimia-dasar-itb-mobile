import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <ThemedText type="title" style={styles.title}>
            Virtual Lab Kimia Dasar
          </ThemedText>
          <ThemedText style={styles.lead}>
            Praktikum digital dengan estetika laboratorium modern ITB: susun alat, pilih reagen,
            dan ikuti skenario titrasi, redoks, serta gravimetri.
          </ThemedText>
          <View style={styles.actionRow}>
            <Pressable style={styles.primary} onPress={() => router.push('/(tabs)/virtual-lab')}>
              <ThemedText style={styles.primaryText}>Masuk ke workbench</ThemedText>
            </Pressable>
            <Pressable style={styles.secondary} onPress={() => router.push('/(tabs)/about-lab')}>
              <ThemedText style={styles.secondaryText}>Panduan & tips</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.cardGrid}>
          <InfoCard
            title="Visual alat nyata"
            desc="Beaker, erlen, buret, dan batang pengaduk divisualkan dengan bentuk khasnya."
            onPress={() => router.push('/(tabs)/virtual-lab')}
          />
          <InfoCard
            title="Preset titrasi"
            desc="Sekali tap untuk memuat setup titrasi, lalu drag untuk penyesuaian." 
            onPress={() => router.push('/(tabs)/virtual-lab')}
          />
          <InfoCard
            title="Keamanan terpandu"
            desc="Hazard label warna-warni untuk korosif, oksidator, mudah terbakar, dan APD."
            onPress={() => router.push('/(tabs)/virtual-lab')}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InfoCard({ title, desc, onPress }: { title: string; desc: string; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.cardDesc}>{desc}</ThemedText>
      <ThemedText style={styles.cardLink}>Lihat detail</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  body: {
    padding: 20,
    gap: 16,
  },
  hero: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22d3ee',
  },
  lead: {
    color: '#e2e8f0',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primary: {
    backgroundColor: '#14b8a6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondary: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0f172a',
  },
  secondaryText: {
    fontWeight: '700',
    color: '#e2e8f0',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
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
