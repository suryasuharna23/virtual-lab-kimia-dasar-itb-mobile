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
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Input, Button, Card } from '@/components/ui'
import { spacing, layout, borderRadius } from '@/constants/theme'

export default function LoginScreen() {
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
      await login({ email, password }, true) // true for student login
      router.replace('/(tabs)')
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
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/itb-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text variant="h2" weight="bold" style={{ color: theme.primary, textAlign: 'center' }}>
              Masuk ke Akun
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }}>
              Silakan masuk untuk mengakses Virtual Lab
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Email"
              placeholder="nama@student.itb.ac.id"
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
              >
                Masuk
              </Button>
            </View>

            <View style={styles.footer}>
              <Text variant="bodySmall" style={{ color: theme.textSecondary }}>
                Belum punya akun?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text variant="bodySmall" weight="bold" style={{ color: theme.primary }}>
                  Daftar
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  formCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
})
