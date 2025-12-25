import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Input, Button } from '@/components/ui'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import { layout, spacing, borderRadius, shadows, colors } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function KontakScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subjek wajib diisi'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Pesan wajib diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await api.post(endpoints.contact.create, formData)
      if (response.success) {
        Alert.alert('Berhasil', 'Pesan Anda telah terkirim. Kami akan segera merespons.', [
          {
            text: 'OK',
            onPress: () => {
              setFormData({ name: '', email: '', subject: '', message: '' })
            },
          },
        ])
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.')
      }
    } catch (error) {
      Alert.alert('Error', 'Tidak dapat mengirim pesan. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    { icon: 'location-outline' as const, label: 'Alamat', value: 'Gedung Labtek XI, Jl. Ganesha No.10, Bandung' },
    { icon: 'mail-outline' as const, label: 'Email', value: 'labkimdasitb@gmail.com' },
    { icon: 'call-outline' as const, label: 'Telepon', value: '(022) 2500935' },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={{ color: theme.textPrimary }}>
          Hubungi Kami
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
            contentContainerStyle={styles.content} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.introSection}>
            <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Kami siap membantu pertanyaan Anda
            </Text>
          </Animated.View>

          <View style={styles.infoSection}>
            {contactInfo.map((item, index) => (
              <Animated.View key={index} entering={FadeInDown.delay(200 + (index * 100)).springify()}>
                  <Card style={styles.infoCard}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                      <Ionicons name={item.icon} size={24} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="caption" style={{ color: theme.textSecondary }}>
                          {item.label}
                      </Text>
                      <Text variant="body" weight="bold" style={{ color: theme.textPrimary }}>
                        {item.value}
                      </Text>
                    </View>
                  </Card>
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Text variant="h3" weight="bold" style={{ marginBottom: spacing.md, color: theme.textPrimary }}>
                Kirim Pesan
            </Text>

            <Card style={styles.formCard}>
                <Input
                label="Nama"
                placeholder="Masukkan nama Anda"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                error={errors.name}
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.textMuted} />}
                />

                <View style={{ marginTop: spacing.md }}>
                <Input
                    label="Email"
                    placeholder="Masukkan email Anda"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textMuted} />}
                />
                </View>

                <View style={{ marginTop: spacing.md }}>
                <Input
                    label="Subjek"
                    placeholder="Masukkan subjek pesan"
                    value={formData.subject}
                    onChangeText={(text) => setFormData({ ...formData, subject: text })}
                    error={errors.subject}
                    leftIcon={<Ionicons name="text-outline" size={20} color={theme.textMuted} />}
                />
                </View>

                <View style={{ marginTop: spacing.md }}>
                <Text variant="caption" weight="semibold" style={{ color: theme.textSecondary, marginBottom: spacing.xs }}>
                  Pesan
                </Text>
                <View style={[
                  styles.messageInputContainer, 
                  { 
                    backgroundColor: theme.surface, 
                    borderColor: errors.message ? colors.error : theme.border 
                  }
                ]}>
                  <TextInput
                    placeholder="Tulis pesan Anda di sini..."
                    placeholderTextColor={theme.textMuted}
                    value={formData.message}
                    onChangeText={(text) => setFormData({ ...formData, message: text })}
                    multiline
                    numberOfLines={4}
                    style={{ 
                      minHeight: 100, 
                      textAlignVertical: 'top',
                      color: theme.textPrimary,
                      fontSize: 16,
                    }}
                  />
                </View>
                {errors.message && (
                  <Text variant="caption" style={{ color: colors.error, marginTop: spacing.xs }}>
                    {errors.message}
                  </Text>
                )}
                </View>

                <View style={{ marginTop: spacing.xl }}>
                <Button 
                    onPress={handleSubmit} 
                    loading={loading} 
                    fullWidth
                    size="lg"
                    variant="primary"
                >
                    Kirim Pesan
                </Button>
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
  introSection: {
    marginBottom: spacing.xl,
  },
  infoSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCard: {
    padding: spacing.xl,
    ...shadows.sm,
  },
  messageInputContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 120,
  },
})
