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
import { StudentRegisterRequest } from '@/types'

export default function RegisterScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState<StudentRegisterRequest & { confirmPassword: string }>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nim: '',
    cohort: '',
    faculty: '',
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<keyof typeof formData | string> | any>({})

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev: StudentRegisterRequest & { confirmPassword: string }) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev: any) => ({ ...prev, [key]: undefined }))
    }
  }

  const validate = () => {
    const newErrors: any = {}
    let isValid = true

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi'
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
      isValid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleRegister = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      // Remove confirmPassword from the request data
      const { confirmPassword, ...registerData } = formData
      
      await register(registerData)
      
      Alert.alert(
        'Pendaftaran Berhasil',
        'Akun Anda telah berhasil dibuat. Selamat datang!',
        [
          {
            text: 'Mulai Belajar',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      )
    } catch (error: any) {
      Alert.alert(
        'Pendaftaran Gagal',
        error.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }

  const navigateToLogin = () => {
    router.back()
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
              Daftar Akun Mahasiswa
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }}>
              Isi data diri Anda untuk membuat akun baru
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Nama Lengkap"
              placeholder="Contoh: Budi Santoso"
              value={formData.full_name}
              onChangeText={(text) => handleChange('full_name', text)}
              error={errors.full_name}
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.textMuted} />}
            />

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="NIM (Nomor Induk Mahasiswa)"
                placeholder="Contoh: 16021001"
                value={formData.nim}
                onChangeText={(text) => handleChange('nim', text)}
                error={errors.nim}
                keyboardType="numeric"
                leftIcon={<Ionicons name="card-outline" size={20} color={theme.textMuted} />}
              />
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="Email"
                placeholder="nama@student.itb.ac.id"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textMuted} />}
              />
            </View>

            <View style={{ marginTop: spacing.md }}>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Input
                    label="Angkatan"
                    placeholder="2024"
                    value={formData.cohort}
                    onChangeText={(text) => handleChange('cohort', text)}
                    error={errors.cohort}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Input
                    label="Fakultas"
                    placeholder="FMIPA"
                    value={formData.faculty}
                    onChangeText={(text) => handleChange('faculty', text)}
                    error={errors.faculty}
                  />
                </View>
              </View>
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="Password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
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

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="Konfirmasi Password"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={theme.textMuted} 
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={{ marginTop: spacing.xl }}>
              <Button 
                onPress={handleRegister} 
                loading={loading} 
                fullWidth
                size="lg"
              >
                Daftar
              </Button>
            </View>

            <View style={styles.footer}>
              <Text variant="bodySmall" style={{ color: theme.textSecondary }}>
                Sudah punya akun?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text variant="bodySmall" weight="bold" style={{ color: theme.primary }}>
                  Masuk
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
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
