import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Input, Button, Card } from '@/components/ui'
import { spacing, layout, borderRadius, colors } from '@/constants/theme'
import { API_BASE_URL, endpoints } from '@/constants/api'
import { Student } from '@/types'

export default function ProfileScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, refreshUser } = useAuth()
  
  const [formData, setFormData] = useState({
    full_name: '',
    nim: '',
    cohort: '',
    faculty: '',
  })
  
  const [avatar, setAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user && !('role' in user)) {
      // It's a student
      const student = user as Student
      setFormData({
        full_name: student.full_name || '',
        nim: student.nim || '',
        cohort: student.cohort || '',
        faculty: student.faculty || '',
      })
      if (student.avatar_url) {
        // Ensure avatar_url is a full URL if it's relative
        const avatarUrl = student.avatar_url.startsWith('http') 
          ? student.avatar_url 
          : `${API_BASE_URL}${student.avatar_url}`
        setAvatar(avatarUrl)
      }
    }
  }, [user])

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      })

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih gambar')
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nama lengkap wajib diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const token = await SecureStore.getItemAsync('auth_token')
      if (!token) throw new Error('Sesi berakhir, silakan login kembali')

      const data = new FormData()
      data.append('full_name', formData.full_name)
      if (formData.nim) data.append('nim', formData.nim)
      if (formData.cohort) data.append('cohort', formData.cohort)
      if (formData.faculty) data.append('faculty', formData.faculty)

      // Append avatar if it's a new local file (starts with file:// or content://)
      if (avatar && (avatar.startsWith('file://') || avatar.startsWith('content://'))) {
        const filename = avatar.split('/').pop() || 'avatar.jpg'
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : 'image/jpeg'
        
        // @ts-ignore
        data.append('avatar', {
          uri: avatar,
          name: filename,
          type,
        })
      }

      const response = await fetch(`${API_BASE_URL}${endpoints.auth.studentProfile}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type is handled automatically by fetch for FormData
        },
        body: data,
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Gagal memperbarui profil')
      }

      await refreshUser()
      
      Toast.show({
        type: 'success',
        text1: 'Berhasil',
        text2: 'Profil berhasil diperbarui',
      })
      
      router.back()
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat menyimpan profil')
    } finally {
      setLoading(false)
    }
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
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: theme.surface }]}
            >
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text variant="h3" weight="bold" style={{ color: theme.textPrimary }}>
              Edit Profil
            </Text>
            <View style={{ width: 40 }} />
          </Animated.View>

          {/* Avatar Section */}
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primarySoft }]}>
                  <Text variant="h1" weight="bold" style={{ color: theme.primary }}>
                    {formData.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[styles.cameraIcon, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={20} color={colors.white} />
              </View>
            </TouchableOpacity>
            <Text variant="bodySmall" style={{ color: theme.textSecondary, marginTop: spacing.sm }}>
              Ketuk untuk mengubah foto
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={{ width: '100%' }}>
            <Card style={styles.formCard}>
              <Input
                label="Nama Lengkap"
                value={formData.full_name}
                onChangeText={(text) => handleChange('full_name', text)}
                error={errors.full_name}
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.textMuted} />}
              />

              <View style={{ marginTop: spacing.md }}>
                <Input
                  label="NIM"
                  value={formData.nim}
                  onChangeText={(text) => handleChange('nim', text)}
                  keyboardType="numeric"
                  leftIcon={<Ionicons name="card-outline" size={20} color={theme.textMuted} />}
                />
              </View>

              <View style={{ marginTop: spacing.md }}>
                <Input
                  label="Email"
                  value={user?.email || ''}
                  editable={false}
                  leftIcon={<Ionicons name="mail-outline" size={20} color={theme.textMuted} />}
                  style={{ opacity: 0.7 }}
                />
              </View>

              <View style={{ marginTop: spacing.md }}>
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <Input
                      label="Angkatan"
                      value={formData.cohort}
                      onChangeText={(text) => handleChange('cohort', text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Input
                      label="Fakultas"
                      value={formData.faculty}
                      onChangeText={(text) => handleChange('faculty', text)}
                    />
                  </View>
                </View>
              </View>

              <View style={{ marginTop: spacing.xl }}>
                <Button 
                  onPress={handleSave} 
                  loading={loading} 
                  fullWidth
                  size="lg"
                  variant="primary"
                >
                  Simpan Perubahan
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
  scrollContent: {
    flexGrow: 1,
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  formCard: {
    padding: spacing.xl,
    borderRadius: borderRadius['2xl'],
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
