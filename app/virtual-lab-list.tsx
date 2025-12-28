import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { virtualLabPractices, virtualLabTools } from '@/constants/virtualLab';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui';
import { spacing, borderRadius, shadows } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function VirtualLabListScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.headerBox}>
        <Text style={[styles.header, { color: theme.textPrimary }]}>Lab Virtual</Text>
        <Text style={[styles.subheader, { color: theme.textSecondary }]}>Pilih praktikum yang ingin disimulasikan:</Text>
      </View>
      <FlatList
        data={virtualLabPractices}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          let iconName = 'flask';
          const firstStepWithTool = item.steps.find(s => s.tools && s.tools.length > 0);
          if (firstStepWithTool && firstStepWithTool.tools.length > 0) {
            const toolKey = firstStepWithTool.tools[0] as keyof typeof virtualLabTools;
            iconName = virtualLabTools[toolKey]?.icon || 'flask';
          }
          return (
            <Card style={{ ...styles.practiceItem, backgroundColor: theme.surface, ...(shadows.sm || {}) }}> 
              <TouchableOpacity
                style={styles.practiceRow}
                onPress={() => router.push({ pathname: '/virtual-lab-simulasi', params: { practiceId: item.id } })}
                activeOpacity={0.85}
              >
                <View style={[styles.practiceIconBox, { borderColor: theme.primary }]}> 
                  <Ionicons name={iconName as any} size={28} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.practiceName, { color: theme.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.practiceDesc, { color: theme.textSecondary }]}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={theme.textMuted} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  headerBox: { marginBottom: 12, marginTop: 8 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subheader: { fontSize: 15, marginBottom: 18 },
  practiceItem: {
    marginBottom: 16,
    borderRadius: borderRadius.lg,
    padding: 0,
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: borderRadius.lg,
  },
  practiceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
  },
  practiceName: { fontSize: 18, fontWeight: 'bold' },
  practiceDesc: { fontSize: 14, marginTop: 4 },
});
