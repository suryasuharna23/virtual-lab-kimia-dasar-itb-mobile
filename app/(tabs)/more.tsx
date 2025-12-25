import React from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text, Badge, Card } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { layout, spacing, borderRadius, colors } from '@/constants/theme'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Student } from '@/types'

export default function MoreScreen() {
  const { theme, isDark, toggleTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const student = user as Student | null

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggleTheme()
  }

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Apakah kamu yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout()
          },
        },
      ]
    )
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
            Pengaturan dan informasi
          </Text>
        </View>

        {isAuthenticated && student && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNavigation('/profile')}
          >
            <Card
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.xl,
                backgroundColor: theme.primarySoft,
              }}
            >
              <View style={[styles.avatar, { backgroundColor: theme.primary, overflow: 'hidden' }]}>
                {student.avatar_url ? (
                  <Image
                    source={{ uri: student.avatar_url }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Ionicons name="person" size={28} color={colors.white} />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text variant="h3" style={{ color: theme.textPrimary }}>
                  {student.full_name || 'Mahasiswa'}
                </Text>
                <Text variant="body" style={{ color: theme.textSecondary }}>
                  {student.email}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </Card>
          </TouchableOpacity>
        )}

        <Text variant="overline" style={[styles.sectionTitle, { color: theme.textMuted }]}>
          Pengaturan
        </Text>

        {isAuthenticated && (
          <MenuItem
            icon="person-circle"
            label="Edit Profil"
            desc="Ubah nama, foto, dan info lainnya"
            onPress={() => handleNavigation('/profile')}
            iconBgColor={theme.primarySoft}
            iconColor={theme.primary}
          />
        )}

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

        <MenuItem
          icon="download"
          label="File Offline"
          desc="Kelola file yang diunduh"
          onPress={() => handleNavigation('/offline-files')}
          iconBgColor={colors.successSoft}
          iconColor={colors.success}
        />

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

        {isAuthenticated && (
          <>
            <Text variant="overline" style={[styles.sectionTitle, { color: theme.textMuted }]}>
              Akun
            </Text>

            <MenuItem
              icon="log-out"
              label="Logout"
              desc="Keluar dari akun"
              onPress={handleLogout}
              iconBgColor={colors.errorSoft}
              iconColor={colors.error}
            />
          </>
        )}

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
