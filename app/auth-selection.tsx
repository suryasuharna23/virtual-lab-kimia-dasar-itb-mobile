import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card } from '@/components/ui';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AuthSelectionScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.springify()} style={styles.headerContainer}>
          <Ionicons name="flask" size={54} color={theme.primary} style={{ marginBottom: 10, alignSelf: 'center' }} />
          <Text variant="h1" style={{ color: theme.primary, fontWeight: '900', marginBottom: 6, textAlign: 'center', letterSpacing: 0.5 }}>
            Selamat Datang
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 18 }}>
            Pilih peran untuk melanjutkan ke sistem praktikum
          </Text>
        </Animated.View>
        <Card style={{
          ...styles.card,
          backgroundColor: theme.surface,
          borderColor: theme.border
        }}>
          <TouchableOpacity
            style={[styles.option]}
            activeOpacity={0.85}
            onPress={() => router.replace('/auth/login')}
          >
            <View style={[styles.iconBadge, { backgroundColor: theme.borderLight }]}>
              <Ionicons name="person" size={28} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="h4" style={{ color: theme.textPrimary, fontWeight: '800', marginBottom: 2 }}>Praktikan</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 2 }}>Akses fitur praktikum, nilai, pengumuman, dan virtual lab.</Text>
              <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.badgeText, { color: isDark ? theme.primary : '#3730A3' }]}>Mahasiswa</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            style={[styles.option, { backgroundColor: theme.accentSoft }]}
            activeOpacity={0.85}
            onPress={() => router.replace('/auth/login-admin' as any)}
          >
            <View style={[styles.iconBadge, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name="shield-checkmark" size={28} color={theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="h4" style={{ color: theme.textPrimary, fontWeight: '800', marginBottom: 2 }}>Asisten/Admin</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 2 }}>Akses dashboard asisten/admin, kelola data, dan monitoring.</Text>
              <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.badgeText, { color: isDark ? theme.accentLight : '#B45309' }]}>Staff</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  headerContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 0,
    borderRadius: 22,
    elevation: 4,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 18,
    gap: 14,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    marginHorizontal: 18,
    opacity: 0.5,
  },
});
