import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card } from '@/components/ui'
import { layout, spacing, shadows } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: 'Apa itu praktikum kimia dasar?',
    answer:
      'Praktikum kimia dasar adalah kegiatan laboratorium yang wajib diikuti oleh mahasiswa tahun pertama untuk mempelajari konsep-konsep dasar kimia melalui eksperimen langsung. Praktikum ini meliputi 12 percobaan yang mencakup berbagai topik seperti stoikiometri, kesetimbangan, dan kinetika.',
  },
  {
    question: 'Bagaimana cara mengakses modul praktikum?',
    answer:
      'Modul praktikum dapat diakses melalui menu "Praktikum" di aplikasi ini. Anda dapat mengunduh modul dalam format PDF untuk dipelajari sebelum pelaksanaan praktikum. Pastikan untuk membaca modul sebelum mengikuti praktikum.',
  },
  {
    question: 'Bagaimana cara melihat nilai praktikum?',
    answer:
      'Nilai praktikum dapat dilihat melalui menu "Nilai" yang tersedia di halaman utama. Anda perlu memasukkan password yang diberikan oleh asisten untuk mengakses file nilai. Nilai akan diperbarui secara berkala setelah setiap praktikum.',
  },
  {
    question: 'Apa yang harus dibawa saat praktikum?',
    answer:
      'Saat praktikum, Anda wajib membawa: 1) Jas lab berwarna putih, 2) Modul praktikum yang sudah dicetak, 3) Alat tulis, 4) Laporan sementara (jika ada), 5) Kartu mahasiswa untuk presensi. Pastikan untuk datang minimal 15 menit sebelum praktikum dimulai.',
  },
  {
    question: 'Bagaimana sistem penilaian praktikum?',
    answer:
      'Sistem penilaian praktikum terdiri dari: Pre-test (10%), Praktikum (40%), Laporan (30%), dan Post-test (20%). Mahasiswa harus memenuhi nilai minimum untuk setiap komponen agar dinyatakan lulus praktikum.',
  },
  {
    question: 'Apa yang harus dilakukan jika tidak bisa hadir praktikum?',
    answer:
      'Jika tidak bisa hadir praktikum karena alasan yang sah (sakit, keperluan mendesak), segera hubungi asisten atau koordinator praktikum. Anda perlu menyertakan surat keterangan dan mengajukan jadwal pengganti. Ketidakhadiran tanpa keterangan akan menyebabkan nilai 0 untuk sesi tersebut.',
  },
  {
    question: 'Bagaimana cara menghubungi asisten praktikum?',
    answer:
      'Anda dapat menghubungi asisten praktikum melalui menu "Kontak" di aplikasi ini, atau langsung datang ke ruang asisten di Gedung Labtek XI lantai 2 pada jam kerja (08:00 - 16:00 WIB).',
  },
  {
    question: 'Apakah Virtual Lab bisa digunakan sebagai pengganti praktikum?',
    answer:
      'Virtual Lab adalah simulasi yang dapat digunakan untuk belajar dan memahami konsep praktikum, namun TIDAK dapat menggantikan praktikum sesungguhnya. Virtual Lab bersifat sebagai materi pembelajaran tambahan.',
  },
]

export default function FAQScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndexes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
  }

  const isExpanded = (index: number) => expandedIndexes.includes(index)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={{ color: theme.textPrimary }}>
          Bantuan & FAQ
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text variant="body" style={{ marginBottom: spacing.lg, color: theme.textSecondary }}>
            Pertanyaan yang sering diajukan seputar praktikum
            </Text>
        </Animated.View>

        {faqData.map((item, index) => (
          <Animated.View key={index} entering={FadeInDown.delay(200 + (index * 50)).springify()}>
            <Card 
                style={styles.card}
                onPress={() => toggleExpand(index)}
            >
                <View style={styles.questionRow}>
                <Text variant="bodyLarge" weight="bold" style={{ flex: 1, color: theme.textPrimary }}>
                    {item.question}
                </Text>
                <Ionicons
                    name={isExpanded(index) ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.primary}
                />
                </View>
                {isExpanded(index) && (
                <View style={[styles.answerContainer, { borderTopColor: theme.border }]}>
                    <Text variant="body" style={{ color: theme.textSecondary, lineHeight: 22 }}>
                    {item.answer}
                    </Text>
                </View>
                )}
            </Card>
          </Animated.View>
        ))}
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
  card: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
})
