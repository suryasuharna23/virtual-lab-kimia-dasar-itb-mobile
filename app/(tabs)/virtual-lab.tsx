import React, { useEffect } from 'react'
import { StyleSheet, View, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text, Button, Badge } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { spacing, layout } from '@/constants/theme'
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing,
    FadeInDown
} from 'react-native-reanimated'

export default function VirtualLabScreen() {
  const { theme } = useTheme()
  const rotation = useSharedValue(0)
  const float = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }), 
        -1, 
        true
    )
    
    float.value = withRepeat(
        withTiming(10, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
    )
  }, [])

  const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: float.value }]
  }))

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="flask" size={80} color={theme.primary} />
            </View>
            <View style={[styles.bubble, { top: 0, right: 10, backgroundColor: theme.accent }]} />
            <View style={[styles.bubble, { top: 20, left: 0, backgroundColor: theme.accent, width: 12, height: 12 }]} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ alignItems: 'center' }}>
            <Badge variant="warning" size="md" style={{ marginBottom: spacing.md }}>
                COMING SOON
            </Badge>
            
            <Text variant="h1" style={{ textAlign: 'center', marginBottom: spacing.sm, fontWeight: '800', color: theme.textPrimary }}>
                Lab Virtual
            </Text>
            
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: theme.textSecondary, marginBottom: spacing.xl, maxWidth: '80%' }}>
                Kami sedang meracik bahan kimia digital untuk pengalaman praktikum yang aman dan seru! 🧪✨
            </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={{ width: '100%', maxWidth: 300 }}>
            <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                onPress={() => Alert.alert("Notifikasi Diaktifkan", "Kami akan memberi tahu Anda saat Lab Virtual siap!")}
                leftIcon={<Ionicons name="notifications-outline" size={20} color="#fff" />}
            >
                Beri Tahu Saya
            </Button>
            
            <Button 
                variant="ghost" 
                size="md" 
                fullWidth 
                style={{ marginTop: spacing.md }}
                onPress={() => Alert.alert("Info", "Fitur ini akan mencakup simulasi titrasi, pencampuran larutan, dan reaksi kimia dasar.")}
            >
                Pelajari Lebih Lanjut
            </Button>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingHorizontal,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bubble: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.8,
  }
})
