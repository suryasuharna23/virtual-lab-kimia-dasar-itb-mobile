import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import * as Sharing from 'expo-sharing'

import { Text } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { layout, spacing } from '@/constants/theme'

export default function PDFViewerScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ uri: string; title: string; localPath?: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const { uri, title, localPath } = params

  const getPdfUrl = () => {
    if (Platform.OS === 'ios') {
      return uri || ''
    }
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri || '')}`
  }

  const handleShare = async () => {
    if (localPath) {
      try {
        await Sharing.shareAsync(localPath)
      } catch (e) {
        console.error('Share error:', e)
      }
    }
  }

  if (!uri) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text variant="h4" weight="bold" style={{ flex: 1, color: theme.textPrimary }} numberOfLines={1}>
            Error
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textMuted} />
          <Text variant="body" style={{ color: theme.textSecondary, marginTop: spacing.md }}>
            URL file tidak valid
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text variant="body" weight="bold" style={{ flex: 1, color: theme.textPrimary }} numberOfLines={1}>
          {title || 'Dokumen'}
        </Text>
        {localPath && (
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={22} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flex: 1 }}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text variant="body" style={{ color: theme.textSecondary, marginTop: spacing.md }}>
              Memuat dokumen...
            </Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={64} color={theme.textMuted} />
            <Text variant="body" style={{ color: theme.textSecondary, marginTop: spacing.md, textAlign: 'center' }}>
              Gagal memuat dokumen.{'\n'}Periksa koneksi internet Anda.
            </Text>
            <TouchableOpacity 
              onPress={() => { setError(false); setIsLoading(true) }} 
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
            >
              <Text variant="body" weight="semibold" style={{ color: '#fff' }}>
                Coba Lagi
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: getPdfUrl() }}
            style={{ flex: 1, opacity: isLoading ? 0 : 1 }}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => { setError(true); setIsLoading(false) }}
            onHttpError={() => { setError(true); setIsLoading(false) }}
            startInLoadingState={false}
            javaScriptEnabled
            domStorageEnabled
            scalesPageToFit
          />
        )}
      </View>
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
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  shareButton: {
    padding: spacing.xs,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
})
