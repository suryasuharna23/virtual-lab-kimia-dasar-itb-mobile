import React, { useState } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'
import * as Haptics from 'expo-haptics'
import Animated, { 
  FadeInDown, 
  FadeIn
} from 'react-native-reanimated'
import { Text, Button, Badge, Card } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { spacing, borderRadius, colors } from '@/constants/theme'
import { Student } from '@/types'

export default function NametagScreen() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const student = user as Student | null
  
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)

  // Generate QR code data
  const qrData = JSON.stringify({
    type: 'LAB_KIMIA_DASAR_NAMETAG',
    studentId: student?.id || 'unknown',
    nim: student?.nim || '-',
    name: student?.full_name || 'Unknown',
    cohort: student?.cohort || '-',
    faculty: student?.faculty || '-',
    timestamp: new Date().toISOString(),
  })

  const simulateScan = async () => {
    setIsScanning(true)
    setScanResult(null)
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    
    // Simulate scanning delay
    setTimeout(async () => {
      // 90% success rate for simulation
      const isSuccess = Math.random() > 0.1
      
      if (isSuccess) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        setScanResult('success')
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        setScanResult('error')
      }
      
      setIsScanning(false)
    }, 2000)
  }

  const resetScan = () => {
    setScanResult(null)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text variant="h3" weight="bold" style={{ color: theme.textPrimary }}>
          Nametag Digital
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Nametag Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card style={styles.nametagCard}>
            {/* Header Badge */}
            <View style={styles.cardHeader}>
              <Badge variant="primary" size="md">
                Lab Kimia Dasar ITB
              </Badge>
            </View>

            {/* Student Info */}
            <View style={styles.studentInfo}>
              {/* Avatar */}
              <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
                {student?.avatar_url ? (
                  <Animated.Image 
                    source={{ uri: student.avatar_url }}
                    style={styles.avatarImage}
                    entering={FadeIn}
                  />
                ) : (
                  <Ionicons name="person" size={40} color={theme.primary} />
                )}
              </View>
              
              <Text variant="h3" weight="bold" style={{ color: theme.textPrimary, textAlign: 'center', marginTop: spacing.md }}>
                {student?.full_name || 'Nama Mahasiswa'}
              </Text>
              
              <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }}>
                {student?.nim || 'NIM tidak tersedia'}
              </Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text variant="caption" style={{ color: theme.textMuted }}>Angkatan</Text>
                  <Text variant="bodySmall" weight="bold" style={{ color: theme.textPrimary }}>
                    {student?.cohort || '-'}
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.infoItem}>
                  <Text variant="caption" style={{ color: theme.textMuted }}>Fakultas</Text>
                  <Text variant="bodySmall" weight="bold" style={{ color: theme.textPrimary }}>
                    {student?.faculty || '-'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.qrContainer}>
              <View style={[styles.qrWrapper, { borderColor: colors.primary }]}>
                <QRCode
                  value={qrData}
                  size={160}
                  backgroundColor="white"
                  color={colors.primary}
                />
              </View>
              <Text variant="caption" style={{ color: theme.textMuted, marginTop: spacing.sm, textAlign: 'center' }}>
                Scan QR ini di mesin absen
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Simulation Section */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.simulationSection}>
          <Text variant="h4" weight="bold" style={{ color: theme.textPrimary, marginBottom: spacing.sm }}>
            Simulasi Absensi
          </Text>
          <Text variant="bodySmall" style={{ color: theme.textSecondary, marginBottom: spacing.md }}>
            Tekan tombol untuk mensimulasikan proses scan di mesin absen
          </Text>

          {scanResult === null ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={simulateScan}
              loading={isScanning}
              leftIcon={!isScanning ? <Ionicons name="scan" size={20} color={colors.white} /> : undefined}
            >
              {isScanning ? 'Memindai QR Code...' : 'Simulasi Scan Absen'}
            </Button>
          ) : scanResult === 'success' ? (
            <View style={styles.resultContainer}>
              <View style={[styles.resultIcon, { backgroundColor: colors.successSoft }]}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              </View>
              <Text variant="h4" weight="bold" style={{ color: colors.success, marginTop: spacing.md }}>
                Absensi Berhasil! ✓
              </Text>
              <Text variant="bodySmall" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }}>
                Kehadiran Anda telah tercatat untuk praktikum hari ini
              </Text>
              <Button
                variant="ghost"
                size="md"
                onPress={resetScan}
                style={{ marginTop: spacing.md }}
              >
                Simulasi Ulang
              </Button>
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <View style={[styles.resultIcon, { backgroundColor: colors.errorSoft }]}>
                <Ionicons name="close-circle" size={48} color={colors.error} />
              </View>
              <Text variant="h4" weight="bold" style={{ color: colors.error, marginTop: spacing.md }}>
                Gagal Memindai
              </Text>
              <Text variant="bodySmall" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }}>
                Pastikan QR code terlihat jelas dan coba lagi
              </Text>
              <Button
                variant="primary"
                size="md"
                onPress={simulateScan}
                style={{ marginTop: spacing.md }}
              >
                Coba Lagi
              </Button>
            </View>
          )}
        </Animated.View>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  nametagCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  studentInfo: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  infoItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  divider: {
    width: 1,
    height: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  qrWrapper: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
  },
  simulationSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
