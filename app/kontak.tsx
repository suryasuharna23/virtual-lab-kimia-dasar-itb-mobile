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
import { layout, spacing, borderRadius } from '@/constants/theme'

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
    { icon: 'location-outline' as const, value: 'Gedung Labtek XI, Jl. Ganesha No.10, Bandung' },
    { icon: 'mail-outline' as const, value: 'labkimdasitb@gmail.com' },
    { icon: 'call-outline' as const, value: '(022) 2500935' },
  ]

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="h2" style={{ marginBottom: spacing.lg }}>
            Kontak Kami
          </Text>

          <Card style={{ marginBottom: spacing.xl }}>
            {contactInfo.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.contactItem,
                  index < contactInfo.length - 1 && { marginBottom: spacing.md },
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name={item.icon} size={18} color={theme.primary} />
                </View>
                <Text variant="body" style={{ flex: 1 }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </Card>

          <Text variant="h4" style={{ marginBottom: spacing.md }}>
            Kirim Pesan
          </Text>

          <Card>
            <Input
              label="Nama"
              placeholder="Masukkan nama Anda"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
              leftIcon={<Ionicons name="person-outline" size={18} color={theme.textMuted} />}
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
                leftIcon={<Ionicons name="mail-outline" size={18} color={theme.textMuted} />}
              />
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Input
                label="Subjek"
                placeholder="Masukkan subjek pesan"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                error={errors.subject}
                leftIcon={<Ionicons name="text-outline" size={18} color={theme.textMuted} />}
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
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
            </View>

            <View style={{ marginTop: spacing.lg }}>
              <Button onPress={handleSubmit} loading={loading} fullWidth>
                Kirim Pesan
              </Button>
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
  content: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
})
