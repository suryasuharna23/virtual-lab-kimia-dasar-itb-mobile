
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, shadows, borderRadius, layout } from '@/constants/theme';
import VirtualLabSimulasi from '../virtual-lab-simulasi';
import { virtualLabPractices, virtualLabTools } from '@/constants/virtualLab';
import { Button, Text, Card } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function VirtualLabTab() {
  const { theme } = useTheme();
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(null);

  if (selectedPracticeId) {
    const practice = virtualLabPractices.find(p => p.id === selectedPracticeId);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1 }}>
          <VirtualLabSimulasi practice={practice} onBack={() => setSelectedPracticeId(null)} />
        </View>
      </SafeAreaView>
    );
  }

  // List Praktikum (styled like Praktikum)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="h2" style={{ color: theme.textPrimary, fontWeight: '800' }}>
            Lab Virtual
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary }}>
            Pilih praktikum yang ingin disimulasikan:
          </Text>
        </View>
        <View style={styles.section}>
          {virtualLabPractices.map((item, index) => {
            let iconName = 'flask';
            const firstStepWithTool = item.steps.find(s => s.tools && s.tools.length > 0);
            if (firstStepWithTool && firstStepWithTool.tools.length > 0) {
              const toolKey = firstStepWithTool.tools[0] as keyof typeof virtualLabTools;
              iconName = virtualLabTools[toolKey]?.icon || 'flask';
            }
            return (
              <Animated.View key={item.id} entering={FadeInDown.delay(200 + (index * 100)).springify()}>
                <Card
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.md,
                    backgroundColor: theme.surface,
                    borderRadius: borderRadius.lg,
                    padding: spacing.lg,
                    ...shadows.sm,
                  }}
                  onPress={() => setSelectedPracticeId(item.id)}
                >
                  <View style={{ width: 48, height: 48, borderRadius: borderRadius.lg, backgroundColor: theme.surfacePurple, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, borderWidth: 1, borderColor: theme.primary }}>
                    <Ionicons name={iconName as any} size={28} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyLarge" style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{item.name}</Text>
                    <Text variant="caption" style={{ color: theme.textSecondary }}>{item.description}</Text>
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  header: {
    marginBottom: layout.sectionGap,
  },
  section: {
    marginBottom: layout.sectionGap,
  },
});
