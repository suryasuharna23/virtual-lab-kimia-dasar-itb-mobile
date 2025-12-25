import React from 'react'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card } from '@/components/ui'
import { layout, spacing, borderRadius, shadows } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Constants from 'expo-constants'

export default function AboutScreen() {
  const { theme } = useTheme()
  const router = useRouter()

  const contactItems = [
    { icon: 'location-outline' as const, label: 'Alamat', value: 'Gedung Labtek XI, Jl. Ganesha No.10, Bandung 40132' },
    { icon: 'mail-outline' as const, label: 'Email', value: 'labkimdasitb@gmail.com' },
    { icon: 'call-outline' as const, label: 'Telepon', value: '(022) 2500935' },
    { icon: 'time-outline' as const, label: 'Jam Operasional', value: 'Senin - Jumat, 08:00 - 16:00 WIB' },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={{ color: theme.textPrimary }}>
          Tentang Aplikasi
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoSection}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('@/assets/images/itb-logo.png')}
                    style={styles.logo}
                    contentFit="contain"
                />
            </View>
            <Text variant="h1" weight="bold" style={{ textAlign: 'center', marginTop: spacing.md, color: theme.textPrimary }}>
                Lab Kimia Dasar
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Institut Teknologi Bandung
            </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Card style={styles.sectionCard}>
                <Text variant="h3" weight="bold" style={{ marginBottom: spacing.sm, color: theme.textPrimary }}>
                    Tentang Kami
                </Text>
                <Text variant="body" style={{ color: theme.textSecondary, lineHeight: 24 }}>
                    Laboratorium Kimia Dasar ITB adalah fasilitas pendidikan yang menyediakan praktikum
                    kimia dasar untuk mahasiswa tahun pertama di Institut Teknologi Bandung. Kami berkomitmen
                    untuk memberikan pengalaman eksperimental yang aman dan edukatif.
                </Text>
            </Card>
        </Animated.View>

        <View style={styles.infoSection}>
            <Text variant="h3" weight="bold" style={{ marginBottom: spacing.md, color: theme.textPrimary }}>
                Informasi Kontak
            </Text>
            {contactItems.map((item, index) => (
                <Animated.View key={index} entering={FadeInDown.delay(300 + (index * 100)).springify()}>
                    <Card style={styles.infoCard}>
                        <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                            <Ionicons name={item.icon} size={24} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text variant="caption" style={{ color: theme.textSecondary, marginBottom: 2 }}>
                                {item.label}
                            </Text>
                            <Text variant="body" weight="bold" style={{ color: theme.textPrimary }}>
                                {item.value}
                            </Text>
                        </View>
                    </Card>
                </Animated.View>
            ))}
        </View>

        <View style={styles.footer}>
            <Text variant="caption" style={{ color: theme.textMuted, textAlign: 'center' }}>
                Versi Aplikasi {Constants.expoConfig?.version || '1.0.0'}
            </Text>
            <Text variant="caption" style={{ color: theme.textMuted, textAlign: 'center', marginTop: 4 }}>
                © {new Date().getFullYear()} Lab Kimia Dasar ITB
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  logo: {
    width: 70,
    height: 70,
  },
  sectionCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
})
