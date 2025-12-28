import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Alert, 
  ScrollView, 
  TouchableOpacity, 
  LayoutAnimation, 
  Platform, 
  UIManager,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, Text, Input, Button } from '@/components/ui';
import { spacing, borderRadius, shadows } from '@/constants/theme';
import { virtualLabTools as rawVirtualLabTools } from '@/constants/virtualLab';

const virtualLabTools: Record<string, VirtualLabTool> = rawVirtualLabTools;

type VirtualLabTool = {
  name: string;
  icon: string;
  type?: string; // Optional: 'compound' | 'tool' | etc.
};

// --- CONFIGURATION ---
const SCREEN_WIDTH = Dimensions.get('window').width;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- NEW COMPONENT: LIQUID CONTAINER (WADAH INTERAKTIF) ---
const LiquidContainer = ({ 
  icon, 
  label, 
  fillLevel, // 0 - 100 (Persentase isi)
  liquidColor, // Hex color code
  isReacting, // Boolean untuk efek gelembung/getar
  theme 
}: any) => {
  // Animasi Tinggi Cairan
  const fillAnim = useRef(new Animated.Value(0)).current;
  // Animasi Warna Cairan (utk transisi halus)
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animasi Level Cairan
    Animated.timing(fillAnim, {
      toValue: fillLevel,
      duration: 1000,
      easing: Easing.bounce, // Efek memantul sedikit seperti air
      useNativeDriver: false, // Height tidak support native driver
    }).start();
  }, [fillLevel]);

  // SVG-like simple shape construction using View styling
  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 160 }}>
      {/* WADAH GELAS (Beaker Shape) */}
      <View style={{
        width: 100,
        height: 120,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderWidth: 3,
        borderColor: theme.textSecondary,
        borderTopWidth: 0, // Bagian atas terbuka
        backgroundColor: 'rgba(255,255,255,0.1)', // Efek kaca transparan
        overflow: 'hidden', // Supaya cairan tidak bocor keluar radius
        position: 'relative'
      }}>
        
        {/* CAIRAN (LIQUID) */}
        <Animated.View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: fillAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%']
          }),
          backgroundColor: liquidColor || theme.primarySoft,
          opacity: 0.8
        }} />

        {/* EFEK GELEMBUNG (Jika sedang bereaksi) */}
        {isReacting && (
          <View style={{ position: 'absolute', bottom: 10, alignSelf: 'center' }}>
             <Ionicons name="ellipse" size={8} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', bottom: 0, left: -20 }} />
             <Ionicons name="ellipse" size={12} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', bottom: 15, left: 10 }} />
             <Ionicons name="ellipse" size={6} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', bottom: 5, left: 20 }} />
          </View>
        )}

        {/* GARIS UKUR (Graduation Marks) */}
        <View style={{ position: 'absolute', right: 5, top: 20, width: 10, height: 2, backgroundColor: theme.textSecondary, opacity: 0.5 }} />
        <View style={{ position: 'absolute', right: 5, top: 50, width: 15, height: 2, backgroundColor: theme.textSecondary, opacity: 0.5 }} />
        <View style={{ position: 'absolute', right: 5, top: 80, width: 10, height: 2, backgroundColor: theme.textSecondary, opacity: 0.5 }} />

      </View>
      
      {/* LABEL OBJEK */}
      <View style={{ marginTop: 12, alignItems: 'center' }}>
        <Text variant="caption" style={{ fontWeight: '700', color: theme.textPrimary }}>{label}</Text>
        {fillLevel > 0 && (
           <Text variant="caption" style={{ fontSize: 10, color: theme.textSecondary }}>
             {fillLevel}% Terisi
           </Text>
        )}
      </View>
    </View>
  );
};


const VirtualLabSimulasi = ({ practice, onBack }: { practice: any, onBack: () => void }) => {
  const { theme } = useTheme();
  
  // State Utama
  const [stepIndex, setStepIndex] = useState(0);
  const [inputs, setInputs] = useState<any>({});
  
  // State Interaktif & Visual
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{type: 'success'|'error'|'info', msg: string} | null>(null);
  
  // --- STATE BARU: VISUALISASI WORKSPACE ---
  const [labVisual, setLabVisual] = useState({
    fillLevel: 0,      // 0 - 100
    liquidColor: '#E5E7EB', // Default (transparent-ish gray)
    isReacting: false,
    temperature: 25,   // Suhu ruang
    observationText: '' // Penjelasan perubahan
  });
  // Ref for beaker pulse animation
  const beakerScale = useRef(new Animated.Value(1)).current;

  const step = practice?.steps[stepIndex];
  const progress = practice ? ((stepIndex + 1) / practice.steps.length) * 100 : 0;

  // Simpan history visual untuk navigasi mundur
  const [visualHistory, setVisualHistory] = useState<any[]>([]);
  useEffect(() => {
    setFeedback(null);
    setSelectedTool(null);
    // Simpan state sebelum step berubah (kecuali step pertama)
    if (stepIndex > 0) {
      setVisualHistory(prev => [...prev, labVisual]);
    }
    // Reset observation text tiap step baru, pertahankan kondisi fisik gelas
    setLabVisual(prev => ({ ...prev, isReacting: false, observationText: '' }));
  }, [stepIndex]);

  // 1. Pilih Alat
  const handleSelectTool = (toolKey: keyof typeof virtualLabTools) => {
    if (selectedTool === toolKey) {
      setSelectedTool(null);
      return;
    }
    setSelectedTool(toolKey);
    // Info: tools vs senyawa/larutan
    const tool = virtualLabTools[toolKey] as VirtualLabTool;
    if ('type' in tool && (tool.type === 'compound' || tool.type === 'solution')) {
      setFeedback({ type: 'info', msg: `Menggunakan ${tool?.name}. Ketuk wadah untuk menuang/mencampurkan ${tool.type === 'solution' ? 'larutan' : 'senyawa'}.` });
    } else {
      setFeedback({ type: 'info', msg: `Menggunakan alat ${tool?.name}. Pilih larutan/senyawa untuk dicampurkan.` });
    }
  };

  // 2. Interaksi dengan Workspace
  const handleObjectInteraction = () => {
    if (!step) return;

    if (!selectedTool) {
      setFeedback({ type: 'info', msg: 'Pilih alat atau senyawa dari bawah!' });
      return;
    }

    const tool = virtualLabTools[selectedTool as keyof typeof virtualLabTools];
    // Only compounds and solutions can be poured/mixed
    if (tool?.type === 'compound' || tool?.type === 'solution') {
      // Simulasi perubahan pada gelas kimia berdasarkan senyawa/larutan
      let newFill = labVisual.fillLevel;
      let newColor = labVisual.liquidColor;
      let newTemp = labVisual.temperature;
      let obsText = '';
      let success = false;

      // Real chemistry: cek apakah step memang mengharapkan senyawa/larutan tertentu
      if (step.type === 'interaction' && selectedTool === step.requiredCompound) {
        newFill = step.resultLevel !== undefined ? step.resultLevel : labVisual.fillLevel + 20;
        newColor = step.resultColor || labVisual.liquidColor;
        newTemp = step.resultTemp || labVisual.temperature;
        obsText = step.observationResult || `Menambahkan ${tool.name}. Terjadi reaksi kimia atau perubahan warna/larutan.`;
        success = true;
      } else {
        // Senyawa/larutan yang tidak sesuai
        obsText = `Tidak terjadi reaksi berarti dengan ${tool.name}.`;
      }

      setLabVisual({
        ...labVisual,
        fillLevel: Math.min(newFill, 100),
        liquidColor: newColor,
        temperature: newTemp,
        isReacting: true,
        observationText: obsText
      });

      setFeedback(success
        ? { type: 'success', msg: 'Reaksi kimia berhasil.' }
        : { type: 'info', msg: 'Tidak ada reaksi kimia.' }
      );

      setTimeout(() => {
        setLabVisual(prev => ({ ...prev, isReacting: false }));
      }, 2000);
    } else {
      // Tools only enable actions, not poured
      setFeedback({ type: 'info', msg: `Alat ${tool?.name} tidak dapat dicampurkan. Pilih larutan/senyawa untuk menuang/mencampur.` });
    }
  };

  const handleNext = () => {
    // Validasi input manual user (jika ada soal isian)
    if (step?.input && !inputs[step.input.key]) {
      Alert.alert('Belum Lengkap', 'Catat hasil pengamatanmu di kolom isian.');
      return;
    }
    if (step?.type === 'interaction' && !labVisual.observationText) {
      Alert.alert('Belum Selesai', 'Lakukan simulasi (tuang/campur bahan) terlebih dahulu.');
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (stepIndex < practice.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onBack();
    }
  };

  // Logic untuk kembali ke step sebelumnya
  const handlePrev = () => {
    if (stepIndex > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setStepIndex(stepIndex - 1);
      // Restore visual state jika ada history
      setLabVisual(visualHistory[visualHistory.length - 1] || labVisual);
      setVisualHistory(prev => prev.slice(0, -1));
    }
  };

  if (!practice) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <Text variant="h3" style={{ fontWeight: '800', color: theme.primary }}>{practice.name}</Text>
             <TouchableOpacity onPress={onBack}><Ionicons name="close" size={24} color={theme.textSecondary} /></TouchableOpacity>
          </View>
          {/* Progress Bar */}
          <View style={{ height: 4, backgroundColor: theme.surfaceElevated, borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
             <View style={{ width: `${progress}%`, height: '100%', backgroundColor: theme.primary }} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          {/* INSTRUCTION CARD */}
          <View style={{ padding: 20 }}>
            <Text variant="h3" style={{ fontWeight: '700', marginBottom: 6 }}>{step?.title}</Text>
            <Text style={{ color: theme.textSecondary, lineHeight: 22 }}>{step?.instruction}</Text>
          </View>

          {/* --- INTERACTIVE WORKSPACE --- */}
          <View style={{ alignItems: 'center', marginVertical: 0 }}>
            <View style={{ 
              width: SCREEN_WIDTH - 40, 
              paddingVertical: 30,
              backgroundColor: theme.surface, // Warna background workspace (putih/gelap)
              borderRadius: borderRadius.xl,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
              ...shadows.lg
            }}>
              
              <Text style={{ position: 'absolute', top: 12, left: 16, fontSize: 10, fontWeight: '700', color: theme.textSecondary, letterSpacing: 1.5 }}>
                WORKSPACE
              </Text>

              {/* KOMPONEN GELAS/WADAH UTAMA */}
              <TouchableOpacity activeOpacity={0.9} onPress={handleObjectInteraction}>
                <Animated.View style={{ transform: [{ scale: beakerScale }] }}>
                  <LiquidContainer 
                     icon={step?.targetIcon || "beaker"}
                     label={step?.targetLabel || "Gelas Kimia"}
                     fillLevel={labVisual.fillLevel}
                     liquidColor={labVisual.liquidColor}
                     isReacting={labVisual.isReacting}
                     theme={theme}
                  />
                </Animated.View>
              </TouchableOpacity>

              {/* INDIKATOR ALAT TERPILIH (Floating Badge) */}
              {selectedTool && (
                <View style={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  backgroundColor: theme.primary, 
                  paddingHorizontal: 10, 
                  paddingVertical: 4, 
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <Ionicons name="hand-right" size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>
                    Memegang: {virtualLabTools[selectedTool].name}
                  </Text>
                </View>
              )}

            </View>

            {/* --- HASIL PENGAMATAN: Sekarang di dalam workspace --- */}
            <View style={{
              marginTop: 18,
              width: SCREEN_WIDTH - 80,
              backgroundColor: theme.surfaceElevated,
              borderRadius: borderRadius.lg,
              padding: 14,
              borderLeftWidth: 4,
              borderLeftColor: '#22C55E',
              ...shadows.md,
              zIndex: 10,
              alignSelf: 'center',
              minHeight: 44
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="eye" size={18} color="#22C55E" style={{ marginRight: 8 }} />
                <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Hasil Pengamatan:</Text>
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                {labVisual.observationText || 'Belum ada pengamatan.'}
              </Text>
            </View>

          </View>

          {/* INPUT DATA SECTION */}
          {step?.input && (
            <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
              <Card style={{ padding: 16, backgroundColor: theme.surfaceElevated }}>
                 <Text variant="caption" style={{ fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', color: theme.textSecondary }}>Data Laporan</Text>
                 <Input 
                    label={step.input.label}
                    placeholder="Contoh: 25 derajat celcius"
                    value={inputs[step.input.key] || ''}
                    onChangeText={val => setInputs({...inputs, [step.input.key]: val})}
                 />
              </Card>
            </View>
          )}

          {/* FEEDBACK ERROR (TOAST) */}
          {feedback && feedback.type === 'error' && (
             <View style={{ marginHorizontal: 20, marginTop: 10, padding: 12, backgroundColor: '#FEE2E2', borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="warning" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={{ color: '#DC2626' }}>{feedback.msg}</Text>
             </View>
          )}

        </ScrollView>

          {/* --- BOTTOM TRAY: TOOLS (moved up, all-rounded, pulse effect) --- */}
          <View style={{
            backgroundColor: theme.surfaceElevated,
            paddingVertical: 16,
            borderRadius: 32,
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 30,
            ...shadows.lg
          }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Alat & Bahan</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button size="sm" onPress={handlePrev} disabled={stepIndex === 0} variant="secondary">
                  Kembali
                </Button>
                <Button size="sm" onPress={handleNext} disabled={step?.type === 'interaction' && !labVisual.observationText}>
                  {stepIndex < practice.steps.length - 1 ? 'Lanjut' : 'Selesai'}
                </Button>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {step?.tools?.map((toolKey: string) => {
                const isSelected = selectedTool === toolKey;
                return (
                 <TouchableOpacity 
                   key={toolKey} 
                   onPress={() => {
                    handleSelectTool(toolKey as any);
                    // Pulse animation for beaker when tool selected
                    Animated.sequence([
                      Animated.timing(beakerScale, { toValue: 1.12, duration: 120, useNativeDriver: true }),
                      Animated.spring(beakerScale, { toValue: 1, friction: 3, useNativeDriver: true })
                    ]).start();
                   }}
                   style={{ alignItems: 'center', marginRight: 16 }}
                 >
                   <View style={{ 
                     width: 64, height: 64, 
                     borderRadius: 32, // all-rounded
                     backgroundColor: isSelected ? theme.primary : theme.background,
                     borderWidth: 1,
                     borderColor: isSelected ? theme.primary : theme.border,
                     justifyContent: 'center', alignItems: 'center',
                     ...shadows.sm
                   }}>
                     <Ionicons name={virtualLabTools[toolKey as keyof typeof virtualLabTools]?.icon as any || 'cube'} size={28} color={isSelected ? '#FFF' : theme.textPrimary} />
                   </View>
                   <Text style={{ fontSize: 10, marginTop: 6, fontWeight: isSelected ? '700' : '500', color: isSelected ? theme.primary : theme.textSecondary }}>
                     {virtualLabTools[toolKey as keyof typeof virtualLabTools]?.name}
                   </Text>
                 </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default VirtualLabSimulasi;