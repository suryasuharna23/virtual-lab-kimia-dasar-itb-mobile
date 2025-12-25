import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Text, 
  UserHeader, 
  AttendanceCard,
  CourseCard,
  Card
} from '@/components/ui'
import type { PraktikumSession } from '@/components/ui/AttendanceCard'
import { layout, spacing, colors } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import { Module, Student } from '@/types'

// Dummy attendance data for simulation
const DUMMY_SESSIONS: PraktikumSession[] = [
  { id: '1', moduleNumber: 1, moduleName: 'Pengenalan Lab', date: '2025-02-10', attended: true },
  { id: '2', moduleNumber: 2, moduleName: 'Titrasi Asam Basa', date: '2025-02-17', attended: true },
  { id: '3', moduleNumber: 3, moduleName: 'Reaksi Redoks', date: '2025-02-24', attended: true },
  { id: '4', moduleNumber: 4, moduleName: 'Termokimia', date: '2025-03-03', attended: false },
  { id: '5', moduleNumber: 5, moduleName: 'Laju Reaksi', date: '2025-03-10', attended: false },
  { id: '6', moduleNumber: 6, moduleName: 'Larutan Koloid', date: '2025-03-17', attended: false },
  { id: '7', moduleNumber: 7, moduleName: 'Analisis Kualitatif', date: '2025-03-24', attended: false },
]

export default function HomeScreen() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [sessions, setSessions] = useState<PraktikumSession[]>(DUMMY_SESSIONS)

  const student = user as Student | null

  const fetchModules = useCallback(async () => {
    try {
      const response = await api.get<Module[]>(endpoints.modules.list)
      if (response.success && response.data) {
        setModules(response.data)
      }
    } catch (error) {
      console.log('Failed to fetch modules:', error)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    await fetchModules()
    // TODO: Fetch real attendance data from API
    setRefreshing(false)
  }, [fetchModules])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const onRefresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  const getUserDisplayName = () => {
    if (!student) return 'Mahasiswa'
    return student.full_name?.split(' ')[0] || 'Mahasiswa'
  }

  const getAttendanceLevel = () => {
    const attended = sessions.filter(s => s.attended).length
    const total = sessions.length
    if (total === 0) return 'Pemula'
    const percentage = (attended / total) * 100
    if (percentage === 100) return 'Master'
    if (percentage >= 75) return 'Mahir'
    if (percentage >= 50) return 'Menengah'
    if (percentage >= 25) return 'Dasar'
    return 'Pemula'
  }

  const getModuleIcon = (index: number): string => {
    const icons = ['flask', 'color-filter', 'sync', 'beaker', 'analytics']
    return icons[index % icons.length]
  }

  const getModuleColor = (index: number): string => {
    const moduleColors = [colors.info, colors.warning, colors.success, colors.error, colors.primary]
    return moduleColors[index % moduleColors.length]
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          <UserHeader 
            name={getUserDisplayName()} 
            level={getAttendanceLevel()}
            avatarUrl={student?.avatar_url}
            onNotificationPress={() => Alert.alert('Notifikasi', 'Tidak ada notifikasi baru')}
            onGiftPress={() => router.push('/nametag' as any)}
          />

          <View style={{ marginBottom: spacing.xl }}>
            <Text variant="h1" weight="bold" style={{ color: theme.textPrimary, marginBottom: spacing.xs }}>
              Halo, {getUserDisplayName()}! 👋
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary }}>
              Siap untuk praktikum kimia hari ini?
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <AttendanceCard 
              sessions={sessions}
              onShowNametagPress={() => router.push('/nametag' as any)}
              style={{ marginBottom: spacing.xl }}
            />
          </Animated.View>

          <View style={{ marginBottom: spacing.xl }}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                <Text variant="h3" weight="bold" style={{ color: theme.textPrimary }}>
                  Modul Praktikum
                </Text>
                <Text 
                  variant="bodySmall" 
                  weight="bold" 
                  style={{ color: theme.primary }}
                  onPress={() => router.push('/praktikum' as any)}
                >
                  Lihat semua
                </Text>
             </View>

             <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: spacing.lg }}
             >
               {modules.length > 0 ? (
                 modules.slice(0, 5).map((module, index) => (
                   <Animated.View 
                      key={module.id} 
                      entering={FadeInDown.delay(200 + (index * 100)).springify()}
                   >
                     <CourseCard 
                       title={module.title}
                       progress={0}
                       iconName={getModuleIcon(index) as any}
                       iconColor={colors.white}
                       iconBgColor={getModuleColor(index)}
                       onPress={() => router.push('/praktikum' as any)}
                     />
                   </Animated.View>
                 ))
               ) : (
                 <Animated.View entering={FadeInDown.delay(200).springify()}>
                   <Card style={{ 
                     width: 200, 
                     height: 140, 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     marginRight: spacing.md 
                   }}>
                     <Ionicons name="cloud-offline-outline" size={32} color={theme.textMuted} />
                     <Text variant="bodySmall" style={{ color: theme.textMuted, marginTop: spacing.sm, textAlign: 'center' }}>
                       Belum ada modul.{'\n'}Tarik untuk refresh.
                     </Text>
                   </Card>
                 </Animated.View>
               )}
             </ScrollView>
          </View>

          <View>
            <Text variant="h3" weight="bold" style={{ color: theme.textPrimary, marginBottom: spacing.md }}>
               Menu Lainnya
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Card 
                  onPress={() => router.push('/nametag' as any)}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 120 }}
                >
                    <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
                       <Ionicons name="qr-code" size={28} color={colors.success} />
                    </View>
                    <Text weight="bold">Nametag</Text>
                </Card>
                <Card 
                  onPress={() => router.push('/pengumuman' as any)}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 120 }}
                >
                     <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.infoSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
                       <Ionicons name="megaphone" size={28} color={colors.info} />
                    </View>
                    <Text weight="bold">Pengumuman</Text>
                </Card>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.lg,
  },
})
