import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Pastikan install ini
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Komponen Kartu Menu dengan Animasi Tekan
const MenuCard = ({ title, icon, color, library, onPress }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const IconLib = library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], width: '48%', marginBottom: 16 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[styles.menuCard, { backgroundColor: theme.surface }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <IconLib name={icon} size={28} color={color} />
        </View>
        <Text style={[styles.menuText, { color: theme.textPrimary }]}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} style={{ marginTop: 8, opacity: 0.5 }} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Komponen Statistik Kecil
const StatItem = ({ label, value, icon, color }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
      </View>
    </View>
  );
};

type AdminStackParamList = {
  AdminGroup: undefined;
  // Tambahkan screen lain jika ada
};

export default function AdminHomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>(); // Typed navigation

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* 1. Header dengan Gradient */}
      <LinearGradient
        colors={[theme.primary, theme.primary + 'CC']} // Gradient dari primary ke sedikit transparan
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Dashboard Admin</Text>
              <Text style={styles.headerSubtitle}>Selamat datang kembali, Surya!</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
               {/* Ganti dengan Image jika ada foto profil */}
              <Ionicons name="person" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* 2. Statistik Utama (Overlay di Header) */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.statsScroll}
          >
            <StatItem label="Mahasiswa" value="120" icon="people" color="#4F46E5" />
            <StatItem label="Modul Aktif" value="8" icon="flask" color="#059669" />
            <StatItem label="Selesai" value="15" icon="checkmark-circle" color="#D97706" />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Konten Utama */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        
        {/* 3. Menu Grid */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Menu Utama</Text>
        <View style={styles.menuGrid}>
          <MenuCard 
            title="Pengumuman" 
            icon="megaphone" 
            color="#E11D48" 
            onPress={() => console.log('Nav ke Pengumuman')} 
          />
          <MenuCard 
            title="Modul Praktikum" 
            icon="document-text" 
            color="#2563EB" 
            onPress={() => console.log('Nav ke Modul')} 
          />
          <MenuCard 
            title="Kelompok" 
            icon="people" 
            color="#7C3AED" 
            onPress={() => navigation.navigate('AdminGroup')} // Contoh Navigasi
          />
          <MenuCard 
            title="Penilaian" 
            icon="clipboard-list-outline" 
            library="MaterialCommunityIcons" 
            color="#059669" 
            onPress={() => console.log('Nav ke Penilaian')} 
          />
        </View>

        {/* 4. Aktivitas Terbaru (Tambahan untuk UX Admin) */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 8 }]}>Aktivitas Terbaru</Text>
        <View style={[styles.recentActivityCard, { backgroundColor: theme.surface }]}>
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.activityText, { color: theme.textPrimary }]}>Kelompok 3 mengumpulkan Laporan</Text>
              <Text style={styles.activityTime}>2 jam yang lalu</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.activityText, { color: theme.textPrimary }]}>Modul 2 telah dipublikasikan</Text>
              <Text style={styles.activityTime}>Hari ini, 09:00</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  headerContainer: {
    height: 240,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  statsScroll: {
    paddingRight: 20,
    paddingBottom: 20,
  },
  statCard: {
    width: 140,
    height: 80,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  statIcon: {
    padding: 8,
    borderRadius: 8,
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 40, // Memberi ruang karena header overlap
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 140,
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
  },
  recentActivityCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    marginLeft: 20,
  },
});