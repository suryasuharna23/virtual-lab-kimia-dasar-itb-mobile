import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    LayoutChangeEvent,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CatalogItem = {
  id: string;
  name: string;
  type: 'tool' | 'reagent';
  description: string;
  hazard?: string;
  hint?: string;
  color: string;
};

type WorkbenchItem = CatalogItem & {
  instanceId: string;
  x: number;
  y: number;
};

type PracticumId = 'titrasi' | 'redoks' | 'gravimetri' | 'buffer';

type PracticumMeta = {
  id: PracticumId;
  title: string;
};

const PRACTICUMS: PracticumMeta[] = [
  { id: 'titrasi', title: 'Titrasi Asam-Basa' },
  { id: 'redoks', title: 'Redoks KMnO4' },
  { id: 'gravimetri', title: 'Gravimetri Sederhana' },
  { id: 'buffer', title: 'Kalibrasi Buffer pH' },
];

const PRACTICUM_GUIDE: Record<PracticumId, { steps: string[]; reminders: string[] }> = {
  titrasi: {
    steps: [
      'Pasang buret di statif, bilas 2x dengan titran untuk mengkondisikan dinding.',
      'Isi buret lewat corong, buang sedikit titran lewat kran hingga nol tepat dan tidak ada gelembung.',
      'Pipet sampel ke erlen, tambahkan indikator atau celupkan pH meter terkalibrasi.',
      'Letakkan erlen di bawah buret, tambahkan batang pengaduk lalu aduk magnet/manual pelan.',
      'Titrasi tetes demi tetes jelang titik akhir; perlambat laju saat warna hampir berubah.',
      'Catat volume awal-akhir buret, hitung selisih sebagai volume titran terpakai.',
    ],
    reminders: [
      'Pastikan nol buret akurat dan kran tidak bocor.',
      'Bilas pipet/erlen dengan sampel jika tersedia untuk meminimalkan pengenceran.',
      'Gunakan kertas putih di belakang erlen untuk melihat perubahan warna indikator.',
    ],
  },
  redoks: {
    steps: [
      'Larutkan KMnO4 sebagai titran, bilas buret 2x dengan KMnO4 untuk kondisioning.',
      'Isi buret KMnO4, buang udara di ujung dan set nol.',
      'Siapkan sampel reduktan di erlen, tambahkan H2SO4 encer jika prosedur mensyaratkan medium asam.',
      'Panaskan ringan jika perlu mempercepat kinetika, aduk konstan selama titrasi.',
      'Teteskan KMnO4 hingga muncul warna ungu muda yang stabil selama ≥30 detik.',
      'Catat volume KMnO4 dan suhu akhir jika relevan.',
    ],
    reminders: [
      'KMnO4 adalah oksidator; jauhkan dari bahan organik/etanol.',
      'Bilas percikan KMnO4 segera untuk mencegah noda permanen.',
      'Gunakan labu erlen cukup besar untuk menghindari tumpahan saat pengadukan.',
    ],
  },
  gravimetri: {
    steps: [
      'Siapkan kertas saring, lipat sesuai corong, timbang kertas + corong kering (blanko).',
      'Larutkan sampel, panaskan bila perlu lalu tambahkan pereaksi pengendap sambil aduk.',
      'Biarkan endapan mengembang/aging untuk mendapatkan kristal lebih besar dan mudah disaring.',
      'Saring campuran ke kertas saring terpasang, cuci endapan hingga bebas ion pengotor (uji filtrat).',
      'Keringkan endapan di oven hingga massa konstan; dinginkan dalam desikator sebelum ditimbang.',
      'Timbang kertas + endapan kering, hitung massa endapan bersih.',
    ],
    reminders: [
      'Jangan menyentuh endapan saat panas; selalu dinginkan dalam desikator sebelum menimbang.',
      'Catat massa blanko dan massa akhir untuk perhitungan gravimetri.',
      'Gunakan pencucian bertahap dengan pelarut sesuai prosedur agar endapan tidak larut.',
    ],
  },
  buffer: {
    steps: [
      'Aktifkan pH meter, bilas probe dengan aquadest lalu keringkan ringan dengan tisu bebas serat.',
      'Kalibrasi dua titik (pH 7 dan 4/10 sesuai rentang kerja); pastikan stabil sebelum set.',
      'Bilas probe, celupkan ke sampel atau buffer target tanpa menyentuh dasar/beaker.',
      'Aduk perlahan untuk menghilangkan gelembung, tunggu pembacaan stabil lalu catat.',
      'Bilas probe setelah pengukuran dan simpan dalam larutan penyimpan atau KCl 3M.',
      'Periksa suhu larutan; gunakan kompensasi suhu jika tersedia.',
    ],
    reminders: [
      'Jaga bulb kaca selalu lembap; jangan simpan probe dalam aquadest murni terlalu lama.',
      'Hindari gelembung udara di sekitar bulb; goyangkan pelan jika perlu.',
      'Gunakan buffer segar dan tertutup untuk kalibrasi agar tidak terkontaminasi.',
    ],
  },
};

const CATALOG: CatalogItem[] = [
  { id: 'pipet', name: 'Pipet Tetes', type: 'tool', description: 'Memindahkan larutan volume kecil.', hint: 'Baik untuk titrasi kualitatif.', color: '#22d3ee' },
  { id: 'buret', name: 'Buret 50 mL', type: 'tool', description: 'Dosis larutan titran dengan presisi.', hint: 'Pasangkan dengan statif.', color: '#10b981' },
  { id: 'erlen', name: 'Erlenmeyer 250 mL', type: 'tool', description: 'Wadah pencampuran titrasi dan pemanasan ringan.', color: '#f59e0b' },
  { id: 'beaker', name: 'Beaker 100 mL', type: 'tool', description: 'Persiapan larutan umum.', color: '#a5f3fc' },
  { id: 'stirring', name: 'Stirring Rod', type: 'tool', description: 'Mengaduk larutan.', color: '#0ea5e9' },
  { id: 'bunsen', name: 'Lampu Bunsen', type: 'tool', description: 'Pemanasan cepat sampel.', hazard: 'Sumber api, jauhkan pelarut mudah terbakar.', color: '#ef4444' },
  { id: 'thermo', name: 'Termometer', type: 'tool', description: 'Pemantauan suhu.', color: '#3b82f6' },
  { id: 'balance', name: 'Neraca Digital', type: 'tool', description: 'Menimbang reagen padat.', color: '#cbd5e1' },
  { id: 'ph', name: 'pH Meter', type: 'tool', description: 'Pengukuran pH cepat.', color: '#14b8a6' },
  { id: 'naoh', name: 'NaOH 0.1 M', type: 'reagent', description: 'Basa kuat untuk titrasi.', hazard: 'Korosif, hindari kontak kulit.', color: '#0ea5e9' },
  { id: 'hcl', name: 'HCl 0.1 M', type: 'reagent', description: 'Asam kuat sebagai titran.', hazard: 'Korosif, gunakan sarung tangan.', color: '#ef4444' },
  { id: 'kmno4', name: 'KMnO4 0.02 M', type: 'reagent', description: 'Oksidator untuk redoks titrasi.', hazard: 'Oksidator, hindari reduktan organik.', color: '#a855f7' },
  { id: 'agno3', name: 'AgNO3 0.05 M', type: 'reagent', description: 'Pengendap halida.', hazard: 'Fotosensitif, simpan gelap.', color: '#94a3b8' },
  { id: 'buffer7', name: 'Buffer pH 7', type: 'reagent', description: 'Standar kalibrasi pH.', color: '#2dd4bf' },
  { id: 'ethanol', name: 'Ethanol 70%', type: 'reagent', description: 'Pelarut dan desinfektan.', hazard: 'Mudah terbakar, jauhkan api.', color: '#f59e0b' },
  { id: 'water', name: 'Aquadest', type: 'reagent', description: 'Pelarut umum dan pembilas.', color: '#bae6fd' },
];

const chipColors = {
  tool: '#e0f2fe',
  reagent: '#ecfeff',
};

const ITEM_SIZE = 108;

export default function VirtualLabSimScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ practicum?: string }>();
  const [benchItems, setBenchItems] = useState<WorkbenchItem[]>([]);
  const [workspaceSize, setWorkspaceSize] = useState({ width: 0, height: 0 });
  const [search, setSearch] = useState('');

  const palette = Colors[colorScheme ?? 'light'];

  const practicumId = (params.practicum as PracticumId | undefined) || undefined;
  const practicumMeta = PRACTICUMS.find((p) => p.id === practicumId);
  const guide = practicumMeta ? PRACTICUM_GUIDE[practicumMeta.id] : undefined;

  useEffect(() => {
    if (practicumId) {
      loadPresetFor(practicumId);
    }
  }, [practicumId]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q),
    );
  }, [search]);

  const addToBench = (item: CatalogItem) => {
    setBenchItems((prev) => {
      const nextX = 16 + ((prev.length % 3) * (ITEM_SIZE + 18));
      const nextY = 16 + Math.floor(prev.length / 3) * (ITEM_SIZE + 22);
      return [
        ...prev,
        {
          ...item,
          instanceId: `${item.id}-${Date.now()}-${prev.length}`,
          x: nextX,
          y: nextY,
        },
      ];
    });
  };

  const updatePosition = (instanceId: string, x: number, y: number) => {
    setBenchItems((prev) => prev.map((entry) => (entry.instanceId === instanceId ? { ...entry, x, y } : entry)));
  };

  const clearBench = () => setBenchItems([]);

  const loadPresetFor = (id: PracticumId) => {
    const presetMap: Record<PracticumId, string[]> = {
      titrasi: ['buret', 'erlen', 'pipet', 'stirring', 'naoh', 'hcl', 'ph'],
      redoks: ['buret', 'erlen', 'stirring', 'kmno4', 'thermo', 'water'],
      gravimetri: ['balance', 'beaker', 'erlen', 'stirring', 'water'],
      buffer: ['beaker', 'ph', 'buffer7', 'pipet', 'water'],
    };
    const presetIds = presetMap[id];
    setBenchItems(
      presetIds.map((pid, index) => {
        const item = CATALOG.find((c) => c.id === pid)!;
        return {
          ...item,
          instanceId: `${item.id}-preset-${index}`,
          x: 18 + ((index % 3) * (ITEM_SIZE + 18)),
          y: 18 + Math.floor(index / 3) * (ITEM_SIZE + 22),
        };
      }),
    );
  };

  const onWorkspaceLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setWorkspaceSize({ width, height });
  };

  if (!practicumMeta) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: '#f8fafc' }]}> 
        <View style={styles.missingWrap}>
          <ThemedText type="title" style={styles.title}>Praktikum belum dipilih</ThemedText>
          <ThemedText style={styles.subtitle}>Silakan pilih praktikum terlebih dahulu.</ThemedText>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/virtual-lab')}>
            <ThemedText style={styles.primaryButtonText}>Pilih praktikum</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#f8fafc' }]}> 
      <ScrollView contentContainerStyle={styles.scrollBody}>
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <ThemedText style={styles.heroBadgeText}>Praktikum aktif</ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>{practicumMeta.title}</ThemedText>
          <ThemedText style={styles.subtitle}>
            Bench otomatis memuat alat dan reagen sesuai skenario. Geser untuk menata ulang, tambahkan item dari palet jika perlu.
          </ThemedText>
          <View style={styles.heroActions}>
            <Pressable style={styles.primaryButton} onPress={() => loadPresetFor(practicumMeta.id)}>
              <ThemedText style={styles.primaryButtonText}>Muat ulang preset</ThemedText>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={clearBench}>
              <ThemedText style={styles.ghostButtonText}>Reset bench</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.legendRow}>
          <LegendChip label="Alat" color={chipColors.tool} textColor="#0A1F44" />
          <LegendChip label="Reagen" color={chipColors.reagent} textColor="#3D2100" />
          <ThemedText style={styles.legendHint}>
            Geser komponen di area kerja untuk mensimulasikan penataan meja laboratorium.
          </ThemedText>
        </View>

        {guide ? (
          <View style={styles.guideCard}>
            <ThemedText type="subtitle" style={styles.guideTitle}>Langkah & panduan</ThemedText>
            <View style={styles.stepList}>
              {guide.steps.map((step, index) => (
                <StepRow key={index} number={index + 1} text={step} />
              ))}
            </View>
            <View style={styles.reminderList}>
              {guide.reminders.map((reminder, idx) => (
                <Bullet key={idx} text={reminder} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.workspaceCard}>
          <View style={styles.workspaceHeader}>
            <ThemedText type="subtitle" style={styles.workspaceTitle}>Workbench</ThemedText>
            <ThemedText style={styles.workspaceMeta}>{benchItems.length} item aktif</ThemedText>
          </View>
          <View style={styles.workspaceSurface} onLayout={onWorkspaceLayout}>
            {workspaceSize.width === 0 && (
              <ThemedText style={styles.workspaceHint}>Area kerja siap digunakan.</ThemedText>
            )}
            {benchItems.map((item) => (
              <DraggableBenchItem
                key={item.instanceId}
                item={item}
                workspaceSize={workspaceSize}
                onPositionChange={updatePosition}
              />
            ))}
          </View>
        </View>

        <View style={styles.paletteHeader}>
          <ThemedText type="subtitle" style={styles.paletteTitle}>
            Palet alat dan reagen
          </ThemedText>
          <ThemedText style={styles.paletteHint}>Tap tambah, lalu atur di workbench.</ThemedText>
        </View>
        <View style={styles.searchBar}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari alat/reagen atau fungsi (misal: buret, pH, panas)"
            placeholderTextColor="rgba(15, 23, 42, 0.4)"
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} style={styles.clearSearch}>
              <ThemedText style={styles.clearSearchText}>Bersihkan</ThemedText>
            </Pressable>
          ) : null}
        </View>
        <FlatList
          data={filteredCatalog}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paletteList}
          renderItem={({ item }) => <PaletteCard item={item} onAdd={() => addToBench(item)} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>Tidak ada hasil. Ubah kata kunci pencarian.</ThemedText>
            </View>
          )}
        />

        <View style={styles.quickNotes}>
          <ThemedText type="subtitle" style={styles.notesTitle}>Catatan praktikum</ThemedText>
          <Bullet text="Titrasi: pasang buret di statif, erlen di bawahnya, pH meter atau indikator di erlen." />
          <Bullet text="Redoks: gunakan KMnO4 sebagai titran pengoksidasi, hindari kontak dengan bahan organik." />
          <Bullet text="Gravimetri: timbang padatan di neraca, gunakan beaker untuk pelarutan awal." />
          <Bullet text="Keamanan: reagen korosif (NaOH, HCl) wajib sarung tangan; ethanol jauhkan dari sumber api." />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function DraggableBenchItem({
  item,
  workspaceSize,
  onPositionChange,
}: {
  item: WorkbenchItem;
  workspaceSize: { width: number; height: number };
  onPositionChange: (id: string, x: number, y: number) => void;
}) {
  const origin = useRef({ x: item.x, y: item.y });
  const [dragging, setDragging] = useState(false);

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          origin.current = { x: item.x, y: item.y };
          setDragging(true);
        },
        onPanResponderMove: (_, gesture) => {
          const limitX = Math.max(workspaceSize.width - ITEM_SIZE, 0);
          const limitY = Math.max(workspaceSize.height - ITEM_SIZE, 0);
          const nextX = clamp(origin.current.x + gesture.dx, 0, limitX);
          const nextY = clamp(origin.current.y + gesture.dy, 0, limitY);
          onPositionChange(item.instanceId, nextX, nextY);
        },
        onPanResponderRelease: () => setDragging(false),
        onPanResponderTerminate: () => setDragging(false),
      }),
    [item.instanceId, item.x, item.y, workspaceSize.height, workspaceSize.width],
  );

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.benchItem,
        {
          backgroundColor: '#ffffff',
          top: item.y,
          left: item.x,
          borderColor: dragging ? '#0d9488' : 'rgba(15, 23, 42, 0.08)',
          shadowOpacity: dragging ? 0.22 : 0.12,
        },
      ]}>
      <View style={styles.benchHeader}>
        <VisualIcon itemId={item.id} color={item.color} type={item.type} />
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.benchItemLabel}>{item.name}</ThemedText>
          <ThemedText style={styles.benchItemType}>{item.type === 'tool' ? 'Alat' : 'Reagen'}</ThemedText>
        </View>
      </View>
      {item.hazard ? <ThemedText style={styles.benchItemHazard}>[!] {item.hazard}</ThemedText> : null}
    </View>
  );
}

function PaletteCard({ item, onAdd }: { item: CatalogItem; onAdd: () => void }) {
  return (
    <View style={[styles.paletteCard, { backgroundColor: item.type === 'tool' ? chipColors.tool : chipColors.reagent }]}> 
      <VisualIcon itemId={item.id} color={item.color} type={item.type} />
      <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
        {item.name}
      </ThemedText>
      <ThemedText style={styles.cardDesc}>{item.description}</ThemedText>
      {item.hazard ? <ThemedText style={styles.cardHazard}>[!] {item.hazard}</ThemedText> : null}
      {item.hint ? <ThemedText style={styles.cardHint}>{item.hint}</ThemedText> : null}
      <Pressable style={styles.addButton} onPress={onAdd}>
        <ThemedText style={styles.addButtonText}>Tambah ke bench</ThemedText>
      </Pressable>
    </View>
  );
}

function LegendChip({ label, color, textColor }: { label: string; color: string; textColor: string }) {
  return (
    <View style={[styles.legendChip, { backgroundColor: color }]}> 
      <ThemedText style={[styles.legendChipText, { color: textColor }]}>{label}</ThemedText>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <ThemedText style={styles.bulletText}>{text}</ThemedText>
    </View>
  );
}

function StepRow({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <ThemedText style={styles.stepBadgeText}>{number}</ThemedText>
      </View>
      <ThemedText style={styles.stepText}>{text}</ThemedText>
    </View>
  );
}

function VisualIcon({ itemId, color }: { itemId: string; color: string; type: 'tool' | 'reagent' }) {
  if (itemId === 'stirring') {
    return <View style={[styles.iconRod, { backgroundColor: color }]} />;
  }

  if (itemId === 'buret') {
    return (
      <View style={styles.iconBuretBody}>
        <View style={[styles.iconTube, { borderColor: color }]}>
          <View style={styles.iconTubeMarks} />
        </View>
        <View style={[styles.iconValve, { backgroundColor: color }]} />
        <View style={[styles.iconTip, { backgroundColor: color }]} />
      </View>
    );
  }

  if (itemId === 'pipet') {
    return (
      <View style={styles.iconDropperWrap}>
        <View style={[styles.iconBulb, { backgroundColor: color }]} />
        <View style={[styles.iconDropper, { backgroundColor: color }]} />
      </View>
    );
  }

  if (itemId === 'erlen') {
    return (
      <View style={styles.iconErlenWrap}>
        <View style={[styles.iconErlenNeck, { backgroundColor: color }]} />
        <View style={[styles.iconErlenBody, { borderColor: color }]}> 
          <View style={[styles.iconLiquid, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (itemId === 'beaker') {
    return (
      <View style={[styles.iconBeaker, { borderColor: color }]}> 
        <View style={styles.iconBeakerSpout} />
        <View style={[styles.iconLiquid, { backgroundColor: color, height: '55%' }]} />
      </View>
    );
  }

  if (itemId === 'bunsen') {
    return (
      <View style={styles.iconBunsen}>
        <View style={[styles.iconFlame, { backgroundColor: '#f97316' }]} />
        <View style={[styles.iconBase, { backgroundColor: color }]} />
      </View>
    );
  }

  if (itemId === 'thermo') {
    return (
      <View style={[styles.iconThermo, { borderColor: color }]}>
        <View style={[styles.iconThermoFill, { backgroundColor: color }]} />
      </View>
    );
  }

  if (itemId === 'balance') {
    return (
      <View style={styles.iconBalance}>
        <View style={[styles.iconBalancePlate, { backgroundColor: color }]} />
        <View style={[styles.iconBalanceArm, { backgroundColor: color }]} />
        <View style={styles.iconBalanceFoot} />
      </View>
    );
  }

  if (itemId === 'ph') {
    return (
      <View style={[styles.iconMeter, { borderColor: color }]}>
        <View style={styles.iconMeterScreen} />
        <View style={[styles.iconProbe, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.iconVial, { borderColor: color }]}> 
      <View style={[styles.iconVialFill, { backgroundColor: color }]} />
    </View>
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
  workspaceSurface: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    backgroundColor: '#f1f5f9',
    minHeight: 420,
    position: 'relative',
    overflow: 'hidden',
    padding: 8,
  },
  workspaceHint: {
    padding: 16,
    color: 'rgba(15, 23, 42, 0.5)',
  },
  benchItem: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    shadowOpacity: 0.12,
    elevation: 4,
    gap: 6,
  },
  benchHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  benchItemLabel: {
    fontWeight: '700',
    color: '#0f172a',
  },
  benchItemType: {
    fontSize: 12,
    color: 'rgba(15, 23, 42, 0.65)',
  },
  benchItemHazard: {
    fontSize: 11,
    color: '#ef4444',
  },
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  guideTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  stepList: {
    gap: 8,
  },
  reminderList: {
    gap: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    color: '#0f172a',
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paletteTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  paletteHint: {
    color: 'rgba(15, 23, 42, 0.6)',
  },
  paletteList: {
    gap: 12,
    paddingVertical: 4,
  },
  searchBar: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#0f172a',
  },
  clearSearch: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
  },
  clearSearchText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  emptyStateText: {
    color: 'rgba(15, 23, 42, 0.6)',
  },
  paletteCard: {
    width: 260,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: '#0f172a',
  },
  cardDesc: {
    color: 'rgba(15, 23, 42, 0.75)',
  },
  cardHazard: {
    color: '#7A2E0D',
    fontSize: 12,
  },
  cardHint: {
    color: '#0F5132',
    fontSize: 12,
  },
  addButton: {
    marginTop: 4,
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickNotes: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  notesTitle: {
    fontWeight: '700',
    color: '#e2e8f0',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22d3ee',
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    color: '#cbd5e1',
  },
  iconRod: {
    width: 10,
    height: 48,
    borderRadius: 8,
  },
  iconBuretBody: {
    alignItems: 'center',
    gap: 6,
  },
  iconTube: {
    width: 14,
    height: 44,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  iconTubeMarks: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(15, 23, 42, 0.15)',
    marginRight: 4,
  },
  iconValve: {
    width: 18,
    height: 8,
    borderRadius: 6,
  },
  iconTip: {
    width: 6,
    height: 10,
    borderRadius: 3,
  },
  iconDropperWrap: {
    alignItems: 'center',
    gap: 4,
  },
  iconBulb: {
    width: 20,
    height: 18,
    borderRadius: 12,
  },
  iconDropper: {
    width: 14,
    height: 52,
    borderRadius: 12,
  },
  iconErlenWrap: {
    alignItems: 'center',
    gap: 6,
  },
  iconErlenNeck: {
    width: 16,
    height: 14,
    borderRadius: 6,
  },
  iconErlenBody: {
    width: 42,
    height: 32,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  iconLiquid: {
    width: '100%',
    height: '50%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  iconBeaker: {
    width: 40,
    height: 38,
    borderWidth: 2,
    borderRadius: 8,
    borderTopLeftRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  iconBeakerSpout: {
    position: 'absolute',
    right: -4,
    top: 6,
    width: 10,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(15, 23, 42, 0.45)',
    borderTopRightRadius: 6,
  },
  iconBunsen: {
    alignItems: 'center',
    gap: 6,
  },
  iconFlame: {
    width: 16,
    height: 22,
    borderRadius: 12,
  },
  iconBase: {
    width: 32,
    height: 10,
    borderRadius: 8,
  },
  iconThermo: {
    width: 14,
    height: 48,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'flex-end',
  },
  iconThermoFill: {
    width: '50%',
    height: '60%',
    borderRadius: 8,
    alignSelf: 'center',
  },
  iconBalance: {
    alignItems: 'center',
    gap: 6,
  },
  iconBalancePlate: {
    width: 34,
    height: 8,
    borderRadius: 8,
  },
  iconBalanceArm: {
    width: 18,
    height: 22,
    borderRadius: 8,
  },
  iconBalanceFoot: {
    width: 30,
    height: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
    borderRadius: 6,
  },
  iconMeter: {
    width: 36,
    height: 30,
    borderWidth: 2,
    borderRadius: 8,
    padding: 4,
    justifyContent: 'space-between',
  },
  iconMeterScreen: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderRadius: 4,
  },
  iconProbe: {
    width: 10,
    height: 8,
    borderRadius: 4,
    alignSelf: 'center',
  },
  iconVial: {
    width: 30,
    height: 46,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  iconVialFill: {
    height: '60%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  missingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
});
