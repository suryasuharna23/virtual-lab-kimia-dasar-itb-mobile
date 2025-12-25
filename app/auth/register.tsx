import React, { useState, useMemo } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Input, Button, Card } from '@/components/ui'
import { spacing, layout, borderRadius, colors } from '@/constants/theme'
import { StudentRegisterRequest } from '@/types'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'Minimal 8 karakter', test: (p) => p.length >= 8 },
  { label: 'Huruf kecil (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'Huruf besar (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Angka (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'Simbol (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

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
  const [showPasswordHints, setShowPasswordHints] = useState(false)

  const passwordValidation = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      ...req,
      passed: req.test(formData.password),
    }))
  }, [formData.password])

  const allPasswordRequirementsMet = useMemo(() => {
    return passwordValidation.every((req) => req.passed)
  }, [passwordValidation])

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
    } else if (!allPasswordRequirementsMet) {
      newErrors.password = 'Password belum memenuhi semua persyaratan'
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

  const PasswordRequirementItem = ({ label, passed }: { label: string; passed: boolean }) => (
    <View style={styles.requirementRow}>
      <Ionicons
        name={passed ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={passed ? colors.success : theme.textMuted}
      />
      <Text
        variant="caption"
        style={{
          marginLeft: spacing.xs,
          color: passed ? colors.success : theme.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  )

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
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
             <View style={styles.floatingIconContainer}>
                <View style={[styles.floatingIcon, { backgroundColor: theme.primarySoft, transform: [{ rotate: '-10deg' }] }]}>
                    <Ionicons name="school" size={32} color={theme.primary} />
                </View>
                <View style={[styles.floatingIcon, { backgroundColor: colors.successSoft, marginTop: 40, transform: [{ rotate: '10deg' }] }]}>
                    <Ionicons name="flask" size={32} color={colors.success} />
                </View>
             </View>
             
            <Text variant="h1" weight="bold" style={{ color: theme.textPrimary, textAlign: 'center', marginBottom: spacing.sm }}>
              Bergabung Sekarang
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center', maxWidth: '80%' }}>
              Buat akun untuk mulai praktikum virtual dan belajar kimia
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ width: '100%' }}>
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
                    label="NIM"
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
                    placeholder="nama@mahasiswa.itb.ac.id"
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
                    placeholder="Buat password yang kuat"
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    error={errors.password}
                    secureTextEntry={!showPassword}
                    onFocus={() => setShowPasswordHints(true)}
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
                
                {showPasswordHints && formData.password.length > 0 && (
                  <View style={[styles.passwordHints, { backgroundColor: theme.surfacePurple }]}>
                    {passwordValidation.map((req, index) => (
                      <PasswordRequirementItem key={index} label={req.label} passed={req.passed} />
                    ))}
                  </View>
                )}
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
                    variant="primary"
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
    marginBottom: spacing.xl,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passwordHints: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
