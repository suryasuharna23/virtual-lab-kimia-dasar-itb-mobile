import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  ZoomIn
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Button, Card } from '@/components/ui';
import { spacing, borderRadius, shadows, layout } from '@/constants/theme';
import { getAllPractices } from '@/features/virtualLab/data/practices';
import { labItems } from '@/features/virtualLab/data/items';
import { Practice } from '@/features/virtualLab/data/types';

const { width } = Dimensions.get('window');

const difficultyColors = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
};

const difficultyLabels = {
  easy: 'Mudah',
  medium: 'Sedang',
  hard: 'Sulit',
};

export default function VirtualLabListScreen() {
  const { theme, isDark } = useTheme(); // tambahkan isDark
  const router = useRouter();
  const practices = getAllPractices();
  
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="h2" style={[styles.title, { color: theme.textPrimary }]}>
            Lab Virtual
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary }}>
            Praktikum kimia aman di mana saja
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daftar Praktikum</Text>

        <View style={styles.practicesList}>
          {practices.map((practice, index) => {
            const firstChemical = practice.steps
              .flatMap(s => s.availableItems)
              .find(id => labItems[id]?.kind === 'chemical');
            const iconColor = firstChemical 
              ? labItems[firstChemical]?.color 
              : theme.primary;

            return (
              <Animated.View 
                key={practice.id} 
                entering={FadeInDown.delay(100 + index * 80).springify()}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setSelectedPractice(practice)}
                >
                  <View style={[
                    styles.practiceCard, 
                    { backgroundColor: theme.surface, borderColor: theme.border }
                  ]}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconBox, { backgroundColor: iconColor + '20' }]}>
                        <Ionicons name="flask" size={24} color={iconColor || theme.primary} />
                      </View>
                      <View style={[styles.difficultyPill, { backgroundColor: difficultyColors[practice.difficulty] + '15' }]}>
                        <Text style={[styles.difficultyText, { color: difficultyColors[practice.difficulty] }]}>
                          {difficultyLabels[practice.difficulty]}
                        </Text>
                      </View>
                    </View>
                    
                    <Text variant="h4" style={[styles.practiceName, { color: theme.textPrimary }]}>
                      {practice.name}
                    </Text>
                    
                    <Text style={[styles.learningLabel, { color: theme.textMuted }]}>
                      KAMU AKAN MEMPELAJARI:
                    </Text>
                    <Text style={[styles.practiceDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {practice.description}
                    </Text>
                    
                    <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                       <View style={styles.metaItem}>
                         <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                         <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                           {practice.estimatedTime}
                         </Text>
                       </View>
                       <View style={styles.metaItem}>
                         <Ionicons name="layers-outline" size={14} color={theme.textSecondary} />
                         <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                           {practice.steps.length} Langkah
                         </Text>
                       </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={!!selectedPractice}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPractice(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          {selectedPractice && (
            <Animated.View 
              entering={ZoomIn.duration(300)}
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <Text variant="h3" style={{ color: theme.textPrimary }}>{selectedPractice.name}</Text>
                <TouchableOpacity onPress={() => setSelectedPractice(null)}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.infoRow}>
                  <View style={styles.infoCol}>
                    <Text style={[styles.label, { color: theme.textMuted }]}>DURASI</Text>
                    <Text style={[styles.value, { color: theme.textPrimary }]}>{selectedPractice.estimatedTime}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={[styles.label, { color: theme.textMuted }]}>KESULITAN</Text>
                    <Text style={[styles.value, { color: theme.textPrimary }]}>{difficultyLabels[selectedPractice.difficulty]}</Text>
                  </View>
                </View>

                <Text style={[styles.label, { color: theme.textMuted, marginTop: 16 }]}>DESKRIPSI</Text>
                <Text style={[styles.desc, { color: theme.textSecondary }]}>
                  {selectedPractice.description}
                </Text>

                <View style={[styles.tipBox, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="information-circle" size={20} color={theme.primary} />
                  <Text style={[styles.tipText, { color: theme.primary }]}>
                    Pastikan kamu membaca setiap instruksi dengan teliti agar reaksi berhasil.
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <Button 
                  variant="secondary" 
                  style={{ flex: 1, alignItems: 'center' }} // pastikan tombolnya juga rata tengah
                  onPress={() => setSelectedPractice(null)}
                  textColor="#FFF"
                >
                  Mode Sandbox
                </Button>
                <Button 
                  style={{ flex: 1, alignItems: 'center' }}
                  onPress={() => {
                    const id = selectedPractice.id;
                    setSelectedPractice(null);
                    router.push({ pathname: '/(tabs)/virtual-lab/[practiceId]', params: { practiceId: id } });
                  }}
                  textColor={isDark ? '#000' : undefined}
                >
                  Mulai Panduan
                </Button>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  practicesList: {
    gap: 16,
  },
  practiceCard: {
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  practiceName: {
    fontWeight: '700',
    marginBottom: 8,
  },
  learningLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  practiceDesc: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: borderRadius.xl,
    padding: 24,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  modalBody: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 16,
  },
  infoCol: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 16,
  },
  tipBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
