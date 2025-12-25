import React, { useState, useCallback } from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, RelativePathString } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card, Badge, Input, Button, LoadingSpinner } from '@/components/ui'
import { api } from '@/lib/api'
import { endpoints } from '@/constants/api'
import { SearchResult } from '@/types'
import { layout, spacing, borderRadius, shadows } from '@/constants/theme'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function SearchScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)
    try {
      const response = await api.getWithQuery<SearchResult[]>(endpoints.search.global, {
        q: query.trim(),
      })
      if (response.success) {
        setResults(response.data)
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'announcement':
        return 'Pengumuman'
      case 'module':
        return 'Modul'
      case 'file':
        return 'File'
      default:
        return type
    }
  }

  const getTypeColor = (type: string): 'primary' | 'accent' | 'success' | 'info' => {
    switch (type) {
      case 'announcement':
        return 'primary'
      case 'module':
        return 'accent'
      case 'file':
        return 'success'
      default:
        return 'info'
    }
  }

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'announcement':
        router.push(`/pengumuman/${result.id}` as RelativePathString)
        break
      case 'module':
        router.push('/(tabs)/praktikum' as RelativePathString)
        break
      case 'file':
        router.push('/(tabs)/praktikum' as RelativePathString)
        break
    }
  }

  const renderResult = ({ item, index }: { item: SearchResult; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => handleResultPress(item)}>
          <View style={styles.resultHeader}>
            <Badge variant={getTypeColor(item.type)} size="sm">
              {getTypeLabel(item.type)}
            </Badge>
            <Text variant="caption" style={{ color: theme.textMuted }}>
              {new Date(item.created_at).toLocaleDateString('id-ID')}
            </Text>
          </View>
          <Text variant="h4" style={{ marginTop: spacing.sm, marginBottom: spacing.xs, color: theme.textPrimary }}>
            {item.title}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.textSecondary }} numberOfLines={2}>
            {item.excerpt}
          </Text>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  )

  const renderRecentSearches = () => (
    <View style={styles.recentContainer}>
        <Text variant="h4" style={{ marginBottom: spacing.md, color: theme.textPrimary }}>Pencarian Populer</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {['Stoikiometri', 'Jadwal', 'Titrasi', 'Nilai'].map((term) => (
                <TouchableOpacity 
                    key={term} 
                    onPress={() => {
                        setQuery(term)
                        // Trigger search manually or effect? 
                        // Since handleSearch depends on query state which is async, better to just set it. 
                        // Ideally we would trigger search in useEffect or helper.
                        // For now let's just set query and user hits search.
                    }}
                    style={[styles.recentChip, { backgroundColor: theme.surface }]}
                >
                    <Ionicons name="search" size={14} color={theme.textSecondary} />
                    <Text variant="caption" style={{ color: theme.textSecondary }}>{term}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
  )

  const renderEmpty = () => {
    if (!hasSearched) {
      return renderRecentSearches()
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={64} color={theme.textMuted} />
        <Text variant="body" style={{ color: theme.textMuted, marginTop: spacing.md, textAlign: 'center' }}>
          Tidak ditemukan hasil untuk &quot;{query}&quot;
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text variant="h2" style={{ color: theme.textPrimary }}>Pencarian</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Cari pengumuman, modul, file..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              leftIcon={<Ionicons name="search-outline" size={20} color={theme.textMuted} />}
              style={{ borderRadius: borderRadius.xl }} // Override to ensure rounded-xl
            />
          </View>
          <Button
            onPress={handleSearch}
            disabled={!query.trim()}
            style={{ marginLeft: spacing.sm, height: 48, width: 48, paddingHorizontal: 0 }}
          >
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </Button>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="lg" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.md,
  },
  listContent: {
    padding: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  recentContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 6,
    ...shadows.sm,
  },
})
