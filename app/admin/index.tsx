import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Text } from '@/components/ui';
import { useRouter } from 'expo-router';

// Helper for shadow style
const shadow = {
  shadowColor: '#1E1B4B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.10,
  shadowRadius: 12,
  elevation: 6,
};

/* =========================================================
   MENU CARD
========================================================= */
const MenuCard = ({
  title,
  subtitle,
  icon,
  color,
  library,
  onPress,
}: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();
  const IconLib =
    library === 'MaterialCommunityIcons'
      ? MaterialCommunityIcons
      : Ionicons;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={{ transform: [{ scale }], width: '48%', marginBottom: 20 }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        style={[
          styles.menuCard,
          { backgroundColor: theme.surface, ...shadow },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}> 
          <IconLib name={icon} size={32} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>
            {title}
          </Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.textSecondary}
          style={{ alignSelf: 'flex-end', opacity: 0.5, marginTop: 8 }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

/* =========================================================
   STAT ITEM
========================================================= */
const StatItem = ({ label, value, icon, color }: any) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface, ...shadow }]}> 
      <View>
        <Text style={[styles.statValue, { color: theme.textPrimary }]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}> 
        <Ionicons name={icon} size={22} color={color} />
      </View>
    </View>
  );
};

export default function AdminHomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* ================= HEADER ================= */}
      <LinearGradient
        colors={[theme.primary, theme.primary + 'E6']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerSubtitle}>
                Selamat datang kembali, <Text style={{ fontWeight: 'bold', color: theme.accent || '#F59E0B' }}>Surya</Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.avatar}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                style={styles.avatarImg}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <StatItem
              label="Mahasiswa"
              value="120"
              icon="people"
              color="#3B82F6"
            />
            <StatItem
              label="Modul Aktif"
              value="8"
              icon="flask"
              color="#10B981"
            />
            <StatItem
              label="Selesai"
              value="15"
              icon="checkmark-circle"
              color="#F59E0B"
            />
            <StatItem
              label="Admin Aktif"
              value="2"
              icon="person"
              color="#7C3AED"
            />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* ================= MAIN ================= */}
      <ScrollView contentContainerStyle={styles.main}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Menu Utama</Text>

        <View style={styles.menuGrid}>
          <MenuCard
            title="Pengumuman"
            subtitle="Info & pemberitahuan"
            icon="megaphone"
            color="#EF4444"
            onPress={() => router.push('/admin/announcement')}
          />
          <MenuCard
            title="Modul Praktikum"
            subtitle="Kelola modul"
            icon="document-text"
            color="#2563EB"
            onPress={() => router.push('/admin/module')}
          />
          <MenuCard
            title="Kelompok"
            subtitle="Atur kelompok"
            icon="people"
            color="#7C3AED"
            onPress={() => router.push('/admin/group')}
          />
          <MenuCard
            title="Penilaian"
            subtitle="Evaluasi hasil"
            icon="clipboard-list-outline"
            library="MaterialCommunityIcons"
            color="#059669"
            onPress={() => router.push('/admin/penilaian' as any)}
          />
        </View>

        {/* Info Cards Section */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 24 }]}>Info Singkat</Text>
        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: '#EDE9FE', ...shadow }]}> 
            <Ionicons name="calendar" size={28} color="#7C3AED" style={{ marginBottom: 8 }} />
            <Text style={{ fontWeight: '700', fontSize: 15, color: '#7C3AED' }}>Jadwal Praktikum</Text>
            <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>Senin & Rabu, 09:00 - 11:00</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: '#FEF3C7', ...shadow }]}> 
            <Ionicons name="trophy" size={28} color="#F59E0B" style={{ marginBottom: 8 }} />
            <Text style={{ fontWeight: '700', fontSize: 15, color: '#F59E0B' }}>Top Group</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>Kelompok 2 (95%)</Text>
          </View>
        </View>

        {/* Recent Activity Section */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 24 }]}>Aktivitas Terbaru</Text>
        <View style={[styles.activityCard, { backgroundColor: theme.surface, ...shadow }]}> 
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <View>
              <Text style={[styles.activityText, { color: theme.textPrimary }]}>Kelompok 3 mengumpulkan laporan</Text>
              <Text style={styles.activityTime}>2 jam lalu</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <View>
              <Text style={[styles.activityText, { color: theme.textPrimary }]}>Modul 2 dipublikasikan</Text>
              <Text style={styles.activityTime}>Hari ini, 09:00</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityItem}>
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <View>
              <Text style={[styles.activityText, { color: theme.textPrimary }]}>Penilaian modul 1 selesai</Text>
              <Text style={styles.activityTime}>Kemarin, 16:30</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */
const styles = StyleSheet.create({
  header: {
    height: 270,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  // headerTitle removed
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 4,
    fontWeight: '500',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    ...shadow,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  statsRow: {
    paddingBottom: 16,
    paddingTop: 2,
    paddingLeft: 2,
  },
  statCard: {
    width: 140,
    height: 90,
    borderRadius: 18,
    padding: 16,
    marginRight: 14,
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  statIcon: {
    alignSelf: 'flex-end',
    padding: 9,
    borderRadius: 12,
  },
  main: {
    padding: 24,
    paddingTop: 36,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuCard: {
    height: 155,
    borderRadius: 22,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginBottom: 0,
  },
  iconContainer: {
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 2,
  },
  infoCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    marginRight: 12,
    alignItems: 'flex-start',
    minWidth: 140,
    maxWidth: 180,
  },
  activityCard: {
    borderRadius: 18,
    padding: 20,
    marginTop: 4,
    backgroundColor: '#FFF',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 7,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
    marginLeft: 20,
  },
});
