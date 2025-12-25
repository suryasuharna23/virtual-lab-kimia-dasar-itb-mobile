import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge, Card } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { layout, spacing, borderRadius, colors } from '@/constants/theme'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'

export default function MoreScreen() {
  const { theme, isDark, toggleTheme } = useTheme()
  const router = useRouter()

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggleTheme()
  }

  const MenuItem = ({
    icon,
    label,
    desc,
    onPress,
    rightElement,
    iconBgColor,
    iconColor,
  }: {
    icon: keyof typeof Ionicons.glyphMap
    label: string
    desc?: string
    onPress: () => void
    rightElement?: React.ReactNode
    iconBgColor: string
    iconColor: string
  }) => (
    <Card
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
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
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      )}
    </Card>
  )

  const handleNavigation = (path: string) => {
    router.push(path as any)
  }

  const handleAdminLogin = () => {
    router.push('/auth/login' as any)
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1" style={{ color: theme.textPrimary }}>
            Lainnya
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary }}>
            Pengaturan dan informasi
          </Text>
        </View>

        {/* Profile Card */}
        <Card
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xl,
            backgroundColor: theme.primarySoft,
          }}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
             <Ionicons name="flask" size={32} color={colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text variant="h3" style={{ color: theme.textPrimary }}>
              Lab Kimia Dasar
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary }}>
              Institut Teknologi Bandung
            </Text>
          </View>
          <Badge variant="warning" size="sm">
            2025
          </Badge>
        </Card>

        {/* Settings Section */}
        <Text variant="overline" style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Pengaturan
        </Text>

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

        {/* Info Section */}
        <Text variant="overline" style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Informasi
        </Text>

        <MenuItem
          icon="information-circle"
          label="Tentang Aplikasi"
          desc="Versi, developer, lisensi"
          onPress={() => handleNavigation('/about')}
          iconBgColor={colors.infoSoft}
          iconColor={colors.info}
        />

        <MenuItem
          icon="help-circle"
          label="Bantuan & FAQ"
          desc="Pertanyaan yang sering diajukan"
          onPress={() => handleNavigation('/faq')}
          iconBgColor={colors.successSoft}
          iconColor={colors.success}
        />

        <MenuItem
          icon="mail"
          label="Hubungi Kami"
          desc="Kirim pesan ke lab"
          onPress={() => handleNavigation('/kontak')}
          iconBgColor={colors.accentSoft}
          iconColor={colors.accent}
        />

        {/* Admin Section */}
        <Text variant="overline" style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Admin
        </Text>

        <MenuItem
          icon="shield-checkmark"
          label="Login Admin"
          desc="Untuk asisten dan dosen"
          onPress={handleAdminLogin}
          iconBgColor={theme.primarySoft}
          iconColor={theme.primary}
        />

        {/* Footer */}
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
  )
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
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
})
