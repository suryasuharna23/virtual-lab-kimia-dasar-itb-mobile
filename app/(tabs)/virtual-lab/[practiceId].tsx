import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Button } from '@/components/ui';
import { borderRadius, shadows } from '@/constants/theme';
import { getPracticeById } from '@/features/virtualLab/data/practices';
import { labItems } from '@/features/virtualLab/data/items';
import { useVirtualLabSimulation } from '@/features/virtualLab/hooks/useVirtualLabSimulation';
import { Workbench } from '@/features/virtualLab/components/Workbench';
import { ToolTray } from '@/features/virtualLab/components/ToolTray';
import { StepCard, ObservationPanel } from '@/features/virtualLab/components/StepCard';
import { CompletionScreen } from '@/features/virtualLab/components/CompletionScreen';
import { LabAction } from '@/features/virtualLab/data/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
type ActionType = 'pour' | 'addDrops' | 'stir' | 'measureTemp';

export default function VirtualLabSimulationScreen() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [targetVesselId, setTargetVesselId] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const practice = getPracticeById(practiceId || '');
  
  const {
    state,
    currentStep,
    progress,
    canProceed,
    selectItem,
    performAction,
    setInput,
    nextStep,
    prevStep,
    reset,
  } = useVirtualLabSimulation(practice || { id: '', name: '', steps: [], initialVessels: [], reactions: [] } as any);

  useEffect(() => {
    if (state.isComplete) {
      setShowCompletion(true);
    }
  }, [state.isComplete]);

  if (!practice) return null;

  const handleVesselTap = (vesselId: string) => {
    if (!state.selectedItemId) {
      Alert.alert('Pilih Alat/Bahan', 'Pilih alat atau bahan terlebih dahulu dari panel bawah.');
      return;
    }
    setTargetVesselId(vesselId);
    setShowActionSheet(true);
  };

  const handleAction = (actionType: ActionType) => {
    if (!targetVesselId || !state.selectedItemId) return;

    const selectedItem = labItems[state.selectedItemId];
    let action: LabAction;

    switch (actionType) {
      case 'pour':
        action = { 
          type: 'pour', 
          fromItemId: state.selectedItemId, 
          toVesselId: targetVesselId, 
          volumeMl: selectedItem?.phase === 'solid' ? 5 : 10 
        };
        break;
      case 'addDrops':
        action = { 
          type: 'addDrops', 
          itemId: state.selectedItemId, 
          toVesselId: targetVesselId, 
          drops: 3 
        };
        break;
      case 'stir':
        action = { type: 'stir', vesselId: targetVesselId };
        break;
      case 'measureTemp':
        action = { type: 'measureTemp', vesselId: targetVesselId };
        break;
      default:
        return;
    }

    performAction(action);
    setShowActionSheet(false);
    setTargetVesselId(null);
    selectItem(null);
  };

  const selectedItem = state.selectedItemId ? labItems[state.selectedItemId] : null;
  const isNextEnabled = canProceed || currentStep?.autoComplete;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text variant="bodyLarge" style={{ color: theme.textPrimary, fontWeight: '700' }} numberOfLines={1}>
              {practice.name}
            </Text>
            <Text style={[styles.stepText, { color: theme.textSecondary }]}>
              Langkah {state.currentStepIndex + 1} dari {practice.steps.length}
            </Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          {practice.steps.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.progressSegment, 
                { 
                  backgroundColor: i < state.currentStepIndex 
                    ? '#22C55E' 
                    : i === state.currentStepIndex 
                      ? theme.primary 
                      : theme.border,
                }
              ]} 
            />
          ))}
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.workbenchSection}>
          <Workbench
            vessels={state.vessels}
            selectedItemId={state.selectedItemId}
            onVesselTap={handleVesselTap}
            theme={theme}
          />
        </View>

        {state.observations.length > 0 && (
          <View style={styles.observationSection}>
            <ObservationPanel observations={state.observations} theme={theme} />
          </View>
        )}

        {currentStep && (
          <View style={styles.stepSection}>
            <StepCard
              step={currentStep}
              inputs={state.inputs}
              onInputChange={setInput}
              theme={theme}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomPanel, { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 16) }]}>
        {state.selectedItemId && (
          <View style={[styles.holdingBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="hand-left" size={14} color="#FFF" />
            <Text style={styles.holdingText}>
              Memegang: {selectedItem?.name}
            </Text>
          </View>
        )}

        {currentStep && (
          <ToolTray
            availableItemIds={currentStep.availableItems}
            selectedItemId={state.selectedItemId}
            onSelectItem={selectItem}
            theme={theme}
          />
        )}

        <View style={styles.navBar}>
          <TouchableOpacity 
            onPress={prevStep} 
            disabled={state.currentStepIndex === 0}
            style={[styles.navBtnSecondary, { opacity: state.currentStepIndex === 0 ? 0.4 : 1 }]}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Kembali</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={nextStep}
            disabled={!isNextEnabled}
            style={[styles.navBtnPrimary, { backgroundColor: theme.primary, opacity: isNextEnabled ? 1 : 0.4 }]}
          >
            <Text style={styles.navBtnPrimaryText}>Lanjut</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowActionSheet(false)}
        >
          <Animated.View 
            entering={SlideInDown.springify()}
            style={[styles.actionSheet, { backgroundColor: theme.surface }]}
          >
            <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
            
            <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
              Pilih Aksi
            </Text>

            {selectedItem && (
              <View style={[styles.usingItemBadge, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name={selectedItem.icon as any} size={14} color={theme.primary} />
                <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>
                  {selectedItem.name}
                </Text>
              </View>
            )}

            <View style={styles.actionGrid}>
              {selectedItem?.kind === 'chemical' && (
                <>
                  {(selectedItem.phase === 'liquid' || selectedItem.phase === 'solution') && (
                    <ActionButton 
                      icon="water" 
                      label="Teteskan" 
                      color="#3B82F6" 
                      onPress={() => handleAction('addDrops')} 
                      theme={theme}
                    />
                  )}
                  <ActionButton 
                    icon="arrow-down" 
                    label={selectedItem.phase === 'solid' ? 'Tambahkan' : 'Tuangkan'} 
                    color="#8B5CF6" 
                    onPress={() => handleAction('pour')} 
                    theme={theme}
                  />
                </>
              )}
              
              {selectedItem?.id === 'stirringRod' && (
                <ActionButton icon="sync" label="Aduk" color="#F59E0B" onPress={() => handleAction('stir')} theme={theme} />
              )}
              
              {selectedItem?.id === 'thermometer' && (
                <ActionButton icon="thermometer" label="Ukur Suhu" color="#EF4444" onPress={() => handleAction('measureTemp')} theme={theme} />
              )}
            </View>

            <TouchableOpacity 
              onPress={() => setShowActionSheet(false)} 
              style={[styles.cancelBtn, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.textSecondary }}>Batal</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <CompletionScreen 
        visible={showCompletion}
        practice={practice}
        onReset={() => {
          reset();
          setShowCompletion(false);
        }}
        onClose={() => {
          setShowCompletion(false);
          router.back();
        }}
        theme={theme}
      />
    </View>
  );
}

function ActionButton({ icon, label, color, onPress, theme }: any) {
  return (
    <TouchableOpacity 
      style={[styles.actionBtn, { backgroundColor: color + '15' }]} 
      onPress={onPress}
    >
      <View style={[styles.actionIconCircle, { backgroundColor: color + '25' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  stepText: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  workbenchSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  observationSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stepSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    ...shadows.lg,
  },
  holdingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 12,
  },
  holdingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  navBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  navBtnSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  navBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navBtnPrimaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  usingItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
    gap: 6,
    alignSelf: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 100,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
