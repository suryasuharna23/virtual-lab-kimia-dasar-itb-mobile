import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card } from '@/components/ui'
import { layout, spacing, borderRadius } from '@/constants/theme'

export default function AboutScreen() {
  const { theme } = useTheme()

  const contactItems = [
    { icon: 'location-outline' as const, label: 'Alamat', value: 'Gedung Labtek XI, Jl. Ganesha No.10, Bandung 40132' },
    { icon: 'mail-outline' as const, label: 'Email', value: 'labkimdasitb@gmail.com' },
    { icon: 'call-outline' as const, label: 'Telepon', value: '(022) 2500935' },
    { icon: 'time-outline' as const, label: 'Jam Operasional', value: 'Senin - Jumat, 08:00 - 16:00 WIB' },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/itb-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text variant="h2" style={{ textAlign: 'center', marginTop: spacing.md }}>
            Lab Kimia Dasar
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Institut Teknologi Bandung
          </Text>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text variant="h4" style={{ marginBottom: spacing.md }}>
            Tentang Kami
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary, lineHeight: 24 }}>
            Laboratorium Kimia Dasar ITB adalah fasilitas pendidikan yang menyediakan praktikum
            kimia dasar untuk mahasiswa tahun pertama di Institut Teknologi Bandung. Laboratorium
            ini bertujuan untuk memberikan pengalaman praktis kepada mahasiswa dalam memahami
            konsep-konsep dasar kimia melalui eksperimen langsung.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text variant="h4" style={{ marginBottom: spacing.md }}>
            Visi & Misi
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary, lineHeight: 24, marginBottom: spacing.md }}>
            <Text style={{ fontWeight: '600' }}>Visi: </Text>
            Menjadi laboratorium pendidikan kimia dasar yang unggul dalam mendukung pembelajaran
            sains berbasis eksperimen.
          </Text>
          <Text variant="body" style={{ color: theme.textSecondary, lineHeight: 24 }}>
            <Text style={{ fontWeight: '600' }}>Misi: </Text>
            Menyediakan fasilitas praktikum yang modern, aman, dan mendukung pengembangan
            keterampilan praktis mahasiswa dalam bidang kimia.
          </Text>
        </Card>

        <Card>
          <Text variant="h4" style={{ marginBottom: spacing.md }}>
            Kontak & Lokasi
          </Text>
          {contactItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.contactItem,
                index < contactItems.length - 1 && { marginBottom: spacing.md },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name={item.icon} size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" style={{ color: theme.textMuted }}>
                  {item.label}
                </Text>
                <Text variant="body">{item.value}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
})
