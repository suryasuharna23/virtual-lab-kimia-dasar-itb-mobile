import { Button, Text } from '@/components/ui';
import { borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Practice } from '../data/types';

const { width } = Dimensions.get('window');

interface CompletionScreenProps {
  visible: boolean;
  practice: Practice;
  onReset: () => void;
  onClose: () => void;
  theme: any;
}

function InsightCard({ icon, title, description, delay, theme }: any) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify()}
      style={[styles.insightCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={[styles.insightIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </View>
      <View style={styles.insightContent}>
        <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.insightDesc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </Animated.View>
  );
}

export function CompletionScreen({ visible, practice, onReset, onClose, theme }: CompletionScreenProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );
      opacity.value = withTiming(1, { duration: 400 });
    } else {
      scale.value = 0.8;
      opacity.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
        <Animated.View style={[styles.container, containerStyle, { backgroundColor: theme.background }]}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Animated.View 
                entering={FadeIn.delay(200)}
                style={[styles.iconRing, { backgroundColor: theme.successSoft }]}
              >
                <Ionicons name="checkmark-sharp" size={48} color={theme.success} />
              </Animated.View>
              
              <Animated.Text 
                entering={FadeInDown.delay(300)}
                style={[styles.title, { color: theme.textPrimary }]}
              >
                Luar Biasa!
              </Animated.Text>
              
              <Animated.Text 
                entering={FadeInDown.delay(400)}
                style={[styles.subtitle, { color: theme.textSecondary }]}
              >
                Kamu telah menyelesaikan praktikum {practice.name}
              </Animated.Text>
            </View>

            <View style={styles.insights}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                POIN UTAMA
              </Text>
              
              <InsightCard 
                icon="flask"
                title="Prosedur Tepat"
                description="Kamu berhasil mengikuti semua langkah praktikum dengan urutan yang benar."
                delay={500}
                theme={theme}
              />
              
              <InsightCard 
                icon="eye"
                title="Observasi Cermat"
                description="Kamu telah mengamati perubahan kimia yang terjadi selama reaksi."
                delay={600}
                theme={theme}
              />
              
              <InsightCard 
                icon="school"
                title="Siap untuk Lab"
                description="Sekarang kamu sudah lebih siap untuk melakukan praktikum ini di laboratorium nyata."
                delay={700}
                theme={theme}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button onPress={onReset} style={styles.button}>
              Ulangi
            </Button>
            <Button onPress={onClose} style={styles.button}>
              Selesai
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  insights: {
    width: '100%',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 16,
    alignItems: 'center',
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
  },
});
