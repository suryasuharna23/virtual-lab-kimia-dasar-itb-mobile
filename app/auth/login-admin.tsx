import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Input, Button, Card } from '@/components/ui'
import { spacing, layout, borderRadius, colors } from '@/constants/theme'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'

export default function LoginAdminScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { login } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    let isValid = true

    if (!email) {
      newErrors.email = 'Email wajib diisi'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleLogin = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      await login({ email, password }, false) // false untuk login admin
      router.replace('/admin') // arahkan ke halaman admin utama
    } catch (error: any) {
      Alert.alert(
        'Login Gagal',
        error.message || 'Terjadi kesalahan saat login. Periksa kembali email dan password Anda.'
      )
    } finally {
      setLoading(false)
    }
  }

  const navigateToRegister = () => {
    router.push('/auth/register' as any)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Illustration / Icons */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
             <View style={styles.floatingIconContainer}>
                <View style={[styles.floatingIcon, { backgroundColor: colors.infoSoft, transform: [{ rotate: '-10deg' }] }]}>
                    <Ionicons name="flask" size={32} color={colors.info} />
                </View>
                <View style={[styles.floatingIcon, { backgroundColor: colors.warningSoft, marginTop: 40, transform: [{ rotate: '10deg' }] }]}>
                    <Ionicons name="book" size={32} color={colors.warning} />
                </View>
             </View>
             
            <Text variant="h1" weight="bold" style={{ color: theme.textPrimary, textAlign: 'center', marginBottom: spacing.sm }}>
              Keep going your learn now
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center', maxWidth: '80%' }}>
              Log in to access your virtual lab and continue your progress
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ width: '100%' }}>
            <Card style={styles.formCard}>
                <Input
                label="Email"
                placeholder="nama@mahasiswa.itb.ac.id"
                value={email}
                onChangeText={(text) => {
                    setEmail(text)
                    if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textMuted} />}
                />

                <View style={{ marginTop: spacing.md }}>
                <Input
                    label="Password"
                    placeholder="Masukkan password"
                    value={password}
                    onChangeText={(text) => {
                    setPassword(text)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                    }}
                    error={errors.password}
                    secureTextEntry={!showPassword}
                    leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />}
                    rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={theme.textMuted} 
                        />
                    </TouchableOpacity>
                    }
                />
                </View>

                <View style={{ marginTop: spacing.xl }}>
                <Button 
                    onPress={handleLogin} 
                    loading={loading} 
                    fullWidth
                    size="lg"
                    variant="primary"
                >
                    Sign In
                </Button>
                </View>

                <View style={styles.footer}>
                <Text variant="bodySmall" style={{ color: theme.textSecondary }}>
                    Haven't an Account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToRegister}>
                    <Text variant="bodySmall" weight="bold" style={{ color: theme.primary }}>
                    Sign Up
                    </Text>
                </TouchableOpacity>
                </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.screenPaddingHorizontal,
    justifyContent: 'center',
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    width: '100%',
  },
  floatingIconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: spacing.xl,
  },
  floatingIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  formCard: {
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
})
