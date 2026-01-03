import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { layout, spacing, borderRadius, colors } from '@/constants/theme';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function AdminMoreScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar dari akun admin?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login-admin');
          },
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    label,
    desc,
    onPress,
    rightElement,
    iconBgColor,
    iconColor,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    desc?: string;
    onPress: () => void;
    rightElement?: React.ReactNode;
    iconBgColor: string;
    iconColor: string;
  }) => (
    <Card
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        padding: spacing.md,
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}> 
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.menuContent}>
        <Text variant="bodyLarge" style={{ color: theme.textPrimary, fontWeight: '600' }}>
          {label}
        </Text>
        {desc && (
          <Text variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
            {desc}
          </Text>
        )}
      </View>
      <View style={styles.rightElementContainer}>
        {rightElement || (
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        )}
      </View>
    </Card>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="h1" style={{ color: theme.textPrimary }}>
            Lainnya
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary }}>
            Pengaturan dan informasi admin
          </Text>
        </View>

        <Text variant="overline" style={[styles.sectionTitle, { color: theme.textMuted }]}>Pengaturan</Text>

        <MenuItem
          icon={isDark ? 'moon' : 'sunny'}
          label="Mode Gelap"
          desc={isDark ? 'Aktif' : 'Nonaktif'}
          onPress={handleToggleTheme}
          iconBgColor={isDark ? colors.primarySoft : colors.warningSoft}
          iconColor={isDark ? colors.primaryLight : colors.warning}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={colors.white}
            />
          }
        />

        <Text variant="overline" style={[styles.sectionTitle, { color: theme.textMuted }]}>Akun</Text>

        <MenuItem
          icon="log-out"
          label="Logout"
          desc="Keluar dari akun admin"
          onPress={handleLogout}
          iconBgColor={colors.errorSoft}
          iconColor={colors.error}
        />

        <View style={styles.footer}>
          <Text variant="caption" style={{ color: theme.textMuted }}>
            Versi {Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text variant="caption" style={{ color: theme.textMuted }}>
            © 2025 Lab Kimia Dasar ITB
          </Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: layout.screenPaddingTop,
  },
  header: {
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  rightElementContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
});
