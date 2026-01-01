import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  Layout, 
  useAnimatedStyle,
  withTiming 
} from 'react-native-reanimated';
import { Text, Input } from '@/components/ui';
import { PracticeStep } from '../data/types';
import { borderRadius, shadows } from '@/constants/theme';

interface StepCardProps {
  step: PracticeStep;
  inputs: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
  theme: any;
}

export function StepCard({ step, inputs, onInputChange, theme }: StepCardProps) {
  const [completedSubtasks, setCompletedSubtasks] = useState<Record<string, boolean>>({});
  const [hintLevel, setHintLevel] = useState(0);

  const toggleSubtask = (id: string) => {
    setCompletedSubtasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleHint = () => {
    setHintLevel(prev => (prev + 1) % 3);
  };

  return (
    <Animated.View 
      layout={Layout.springify()} 
      entering={FadeInDown}
      style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.stepBadgeText}>LANGKAH UTAMA</Text>
        </View>
        <Text variant="h3" style={[styles.title, { color: theme.textPrimary }]}>
          {step.title}
        </Text>
      </View>
      
      <Text style={[styles.instruction, { color: theme.textSecondary }]}>
        {step.instruction}
      </Text>

      {step.requiredActions.length > 0 && (
        <View style={styles.checklist}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DAFTAR TUGAS</Text>
          {step.requiredActions.map((action, i) => {
            const id = `${step.id}-action-${i}`;
            const isDone = completedSubtasks[id];
            
            return (
              <TouchableOpacity 
                key={id} 
                onPress={() => toggleSubtask(id)}
                activeOpacity={0.7}
                style={styles.checkItem}
              >
                <View style={[
                  styles.checkBox, 
                  { 
                    borderColor: isDone ? theme.primary : theme.border,
                    backgroundColor: isDone ? theme.primary : 'transparent'
                  }
                ]}>
                  {isDone && <Ionicons name="checkmark" size={12} color="#FFF" />}
                </View>
                <Text style={[
                  styles.checkText, 
                  { 
                    color: isDone ? theme.textMuted : theme.textSecondary,
                    textDecorationLine: isDone ? 'line-through' : 'none'
                  }
                ]}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {step.input && (
        <View style={styles.inputSection}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DATA PENGAMATAN</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Input
                label={step.input.label}
                placeholder={step.input.type === 'number' ? '0' : 'Ketik di sini...'}
                value={inputs[step.input.key] || ''}
                onChangeText={(val) => onInputChange(step.input!.key, val)}
                keyboardType={step.input.type === 'number' ? 'numeric' : 'default'}
              />
            </View>
            {step.input.unit && (
              <Text style={[styles.unitText, { color: theme.textMuted }]}>
                {step.input.unit}
              </Text>
            )}
          </View>
        </View>
      )}

      {step.hint && (
        <TouchableOpacity 
          onPress={handleHint}
          style={[styles.hintButton, { backgroundColor: hintLevel > 0 ? theme.primarySoft : theme.surfaceElevated }]}
        >
          <Ionicons 
            name={hintLevel > 0 ? "bulb" : "bulb-outline"} 
            size={18} 
            color={hintLevel > 0 ? theme.primary : theme.textSecondary} 
          />
          <Text style={[styles.hintBtnText, { color: hintLevel > 0 ? theme.primary : theme.textSecondary }]}>
            {hintLevel === 0 ? "Butuh Bantuan?" : "Petunjuk Ditampilkan"}
          </Text>
        </TouchableOpacity>
      )}

      {hintLevel > 0 && step.hint && (
        <Animated.View 
          entering={FadeInDown} 
          style={[styles.hintBox, { backgroundColor: theme.surfaceElevated }]}
        >
          <Text style={[styles.hintText, { color: theme.textSecondary }]}>{step.hint}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

interface ObservationPanelProps {
  observations: string[];
  theme: any;
}

export function ObservationPanel({ observations, theme }: ObservationPanelProps) {
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    if (observations.length > 0) setExpanded(true);
  }, [observations.length]);

  if (observations.length === 0) return null;

  return (
    <View style={[styles.obsContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TouchableOpacity 
        style={styles.obsHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.obsTitleRow}>
          <View style={[styles.obsIcon, { backgroundColor: '#22C55E' }]}>
            <Ionicons name="eye" size={14} color="#FFF" />
          </View>
          <Text style={[styles.obsTitle, { color: theme.textPrimary }]}>
            Hasil Pengamatan ({observations.length})
          </Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.textMuted} 
        />
      </TouchableOpacity>

      {expanded && (
        <Animated.View entering={FadeInDown} style={styles.obsContent}>
          {observations.map((obs, i) => (
            <View key={i} style={styles.obsItem}>
              <View style={styles.timeLine}>
                <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                {i < observations.length - 1 && (
                  <View style={[styles.line, { backgroundColor: theme.border }]} />
                )}
              </View>
              <View style={styles.obsTextContainer}>
                <Text style={[styles.obsText, { color: theme.textSecondary }]}>{obs}</Text>
                <Text style={[styles.obsWhy, { color: theme.primary }]}>Mengapa ini terjadi?</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    ...shadows.sm,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  header: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  stepBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontWeight: '700',
    fontSize: 20,
  },
  instruction: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  checklist: {
    gap: 12,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 14,
    flex: 1,
  },
  inputSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  hintBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hintBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: borderRadius.lg,
  },
  hintText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  obsContainer: {
    marginHorizontal: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  obsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  obsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  obsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  obsContent: {
    padding: 16,
    paddingTop: 0,
  },
  obsItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timeLine: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  line: {
    width: 1,
    flex: 1,
    marginVertical: 4,
  },
  obsTextContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  obsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  obsWhy: {
    fontSize: 12,
    fontWeight: '600',
  },
});
