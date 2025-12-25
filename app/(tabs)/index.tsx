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
import { Announcement } from '@/types'

export default function HomeScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [streak, setStreak] = useState(3) // Mock streak
  const [completedDays, setCompletedDays] = useState([true, true, true, false, false, false, false]) // Mock days

  // Keep existing logic for fetching something just to show activity
  const fetchData = useCallback(async () => {
    // Simulate fetch
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  const courses = [
    { id: 1, title: 'Modul 1: Stoikiometri', progress: 0.75, icon: 'flask', color: colors.info },
    { id: 2, title: 'Modul 2: Titrasi Asam Basa', progress: 0.30, icon: 'color-filter', color: colors.warning },
    { id: 3, title: 'Modul 3: Kesetimbangan Kimia', progress: 0.10, icon: 'sync', color: colors.success },
  ]

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
          
          {/* 1. Header */}
          <UserHeader 
            name="Rara" 
            level="Beginner" 
            onNotificationPress={() => Alert.alert('Notifikasi', 'Tidak ada notifikasi baru')}
            onGiftPress={() => Alert.alert('Hadiah', 'Kumpulkan streak untuk hadiah!')}
          />

          {/* 2. Greeting */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text variant="h1" weight="bold" style={{ color: theme.textPrimary, marginBottom: spacing.xs }}>
              Siap praktikum?
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary }}>
              Lanjutkan streak dan progress belajarmu
            </Text>
          </View>

          {/* 3. Streak Card */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <StreakCard 
              streakCount={streak}
              completedDays={completedDays}
              onRewardPress={() => Alert.alert('Streak Reward', 'Selamat! Kamu konsisten belajar.')}
              style={{ marginBottom: spacing.xl }}
            />
          </Animated.View>

          {/* 4. Ongoing Course Section */}
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
               {courses.map((course, index) => (
                 <Animated.View 
                    key={course.id} 
                    entering={FadeInDown.delay(200 + (index * 100)).springify()}
                 >
                   <CourseCard 
                     title={course.title}
                     progress={course.progress}
                     iconName={course.icon as any}
                     iconColor={colors.white}
                     iconBgColor={course.color}
                     onPress={() => router.push('/praktikum' as any)}
                   />
                 </Animated.View>
               ))}
             </ScrollView>
          </View>

          {/* 5. Quick Links (Optional additions based on context) */}
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
