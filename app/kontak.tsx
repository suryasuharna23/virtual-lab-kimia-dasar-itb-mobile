import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Input, Button } from '@/components/ui'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import { layout, spacing, borderRadius, shadows } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function KontakScreen() {
  const { theme } = useTheme()
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
            contentContainerStyle={styles.content} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <Text variant="h2" weight="bold" style={{ color: theme.textPrimary, textAlign: 'center' }}>
                Hubungi Kami
            </Text>
            <Text variant="body" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: spacing.xs }}>
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
                <Input
                    label="Pesan"
                    placeholder="Tulis pesan Anda di sini..."
                    value={formData.message}
                    onChangeText={(text) => setFormData({ ...formData, message: text })}
                    error={errors.message}
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 120, textAlignVertical: 'top', paddingTop: spacing.sm }}
                />
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
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.lg,
  },
  header: {
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
})
