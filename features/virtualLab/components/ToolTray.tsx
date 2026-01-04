import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  useSharedValue,
  withRepeat,
  withSequence,
  FadeInRight,
  FadeIn
} from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { LabItem } from '../data/types';
import { labItems } from '../data/items';
import { borderRadius, shadows } from '@/constants/theme';

interface ToolTrayProps {
  availableItemIds: string[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  theme: any;
}

type Tab = 'tools' | 'chemicals';

export function ToolTray({ availableItemIds, selectedItemId, onSelectItem, theme }: ToolTrayProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chemicals');

  const items = availableItemIds
    .map(id => labItems[id])
    .filter((item): item is LabItem => item !== undefined);

  const tools = items.filter(item => item.kind === 'tool');
  const chemicals = items.filter(item => item.kind === 'chemical');

  const hasTools = tools.length > 0;
  const hasChemicals = chemicals.length > 0;
  
  const textOnPrimary = theme.primary === '#E8E6F2' ? '#1E1B4B' : '#FFF';

  React.useEffect(() => {
    if (activeTab === 'chemicals' && !hasChemicals && hasTools) setActiveTab('tools');
    if (activeTab === 'tools' && !hasTools && hasChemicals) setActiveTab('chemicals');
  }, [hasTools, hasChemicals]);

  const displayedItems = activeTab === 'chemicals' ? chemicals : tools;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {selectedItemId && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={[styles.holdingBadge, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="hand-left" size={14} color={textOnPrimary} />
          <Text style={[styles.holdingText, { color: textOnPrimary }]}>Dalam Genggaman</Text>
        </Animated.View>
      )}

      <View style={styles.tabsRow}>
        <TabButton 
          active={activeTab === 'chemicals'} 
          label="Bahan Kimia" 
          icon="flask"
          count={chemicals.length}
          onPress={() => setActiveTab('chemicals')}
          theme={theme}
          disabled={!hasChemicals}
        />
        <TabButton 
          active={activeTab === 'tools'} 
          label="Alat Lab" 
          icon="build" 
          count={tools.length}
          onPress={() => setActiveTab('tools')}
          theme={theme}
          disabled={!hasTools}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayedItems.length > 0 ? (
          displayedItems.map((item, index) => (
            <ItemTile
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onPress={() => onSelectItem(selectedItemId === item.id ? null : item.id)}
              index={index}
              theme={theme}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Tidak ada item dalam kategori ini
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TabButton({ active, label, icon, count, onPress, theme, disabled }: any) {
  if (disabled) return null;
  
  const textOnPrimary = theme.primary === '#E8E6F2' ? '#1E1B4B' : '#FFF';
  
  return (
    <TouchableOpacity  
      onPress={onPress} 
      style={[
        styles.tab, 
        active && styles.activeTab,
        active && { backgroundColor: theme.primary + '15' }
      ]}
    >
      <Ionicons 
        name={active ? icon : `${icon}-outline`} 
        size={16} 
        color={active ? theme.primary : theme.textSecondary} 
      />
      <Text style={[
        styles.tabText, 
        { color: active ? theme.primary : theme.textSecondary, fontWeight: active ? '700' : '500' }
      ]}>
        {label}
      </Text>
      <View style={[styles.badge, { backgroundColor: active ? theme.primary : theme.surfaceElevated }]}>
        <Text style={[styles.badgeText, { color: active ? textOnPrimary : theme.textSecondary }]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ItemTile({ item, isSelected, onPress, index, theme }: any) {
  const scale = useSharedValue(1);
  const textOnPrimary = theme.primary === '#E8E6F2' ? '#1E1B4B' : '#FFF';
  
  React.useEffect(() => {
    if (isSelected) {
      scale.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 400 }), withTiming(1, { duration: 400 })),
        -1, true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: isSelected ? theme.primary : 'transparent',
    borderWidth: isSelected ? 2 : 0,
  }));

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <Pressable onPress={onPress}>
        <Animated.View style={[
          styles.itemTile, 
          { backgroundColor: theme.background },
          animatedStyle
        ]}>
          <View style={[
            styles.iconBox, 
            { backgroundColor: isSelected ? theme.primarySoft : theme.surfaceElevated }
          ]}>
            <Ionicons 
              name={item.icon} 
              size={28} 
              color={isSelected ? theme.primary : theme.textPrimary} 
            />
            
            {item.kind === 'chemical' && item.color && (
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            )}
            
            {isSelected && (
              <View style={[styles.checkBadge, { backgroundColor: theme.primary, borderColor: theme.primary === '#E8E6F2' ? '#1E1B4B' : '#FFF' }]}>
                <Ionicons name="checkmark" size={10} color={textOnPrimary} />
              </View>
            )}
          </View>
          
          <Text 
            numberOfLines={2} 
            style={[styles.itemName, { color: isSelected ? theme.primary : theme.textPrimary }]}
          >
            {item.name}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  holdingBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    zIndex: 10,
    ...shadows.sm,
  },
  holdingText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  activeTab: {
  },
  tabText: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 10,
  },
  itemTile: {
    width: 80,
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: borderRadius.lg,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  colorDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  itemName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    height: 28, 
  },
  emptyState: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  }
});
