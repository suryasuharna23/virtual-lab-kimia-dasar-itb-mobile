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
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Text, 
  UserHeader, 
  StreakCard, 
  CourseCard,
  Card
} from '@/components/ui'
import { layout, spacing, colors } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import { Module, Student } from '@/types'

export default function HomeScreen() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [modules, setModules] = useState<Module[]>([])
  const [streak, setStreak] = useState(0)
  const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false])

  const student = user as Student | null

  const fetchModules = useCallback(async () => {
    try {
      const response = await api.get<Module[]>(endpoints.modules.list)
      if (response.success && response.data) {
        setModules(response.data.slice(0, 3))
      }
    } catch (error) {
      console.log('Failed to fetch modules:', error)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setRefreshing(true)
    await fetchModules()
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
            level="Beginner"
            avatarUrl={student?.avatar_url}
            onNotificationPress={() => Alert.alert('Notifikasi', 'Tidak ada notifikasi baru')}
            onGiftPress={() => Alert.alert('Hadiah', 'Kumpulkan streak untuk hadiah!')}
          />

          <View style={{ marginBottom: spacing.xl }}>
            <Text variant="h1" weight="bold" style={{ color: theme.textPrimary, marginBottom: spacing.xs }}>
              Siap praktikum?
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary }}>
              Lanjutkan streak dan progress belajarmu
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <StreakCard 
              streakCount={streak}
              completedDays={completedDays}
              onRewardPress={() => Alert.alert('Streak Reward', 'Selamat! Kamu konsisten belajar.')}
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
                 modules.map((module, index) => (
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
                 [1, 2, 3].map((_, index) => (
                   <Animated.View 
                      key={index} 
                      entering={FadeInDown.delay(200 + (index * 100)).springify()}
                   >
                     <CourseCard 
                       title={`Modul ${index + 1}`}
                       progress={0}
                       iconName={getModuleIcon(index) as any}
                       iconColor={colors.white}
                       iconBgColor={getModuleColor(index)}
                       onPress={() => router.push('/praktikum' as any)}
                     />
                   </Animated.View>
                 ))
               )}
             </ScrollView>
          </View>

          <View>
            <Text variant="h3" weight="bold" style={{ color: theme.textPrimary, marginBottom: spacing.md }}>
               Menu Lainnya
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Card 
                  onPress={() => router.push('/virtual-lab' as any)}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 100 }}
                >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                       <Text style={{ fontSize: 24 }}>🧪</Text>
                    </View>
                    <Text weight="bold">Virtual Lab</Text>
                </Card>
                <Card 
                  onPress={() => router.push('/pengumuman' as any)}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 100 }}
                >
                     <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.infoSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                       <Text style={{ fontSize: 24 }}>📢</Text>
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
