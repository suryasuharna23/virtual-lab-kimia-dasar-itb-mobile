import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { Text, Card } from '@/components/ui'
import { layout, spacing } from '@/constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export interface QuickAccessItem {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
  onPress: () => void
}

interface QuickAccessProps {
  items: QuickAccessItem[]
  columns?: number
  style?: ViewStyle
}

export function QuickAccess({ items, columns = 2, style }: QuickAccessProps) {
  const { theme } = useTheme()

  // Calculate width based on columns and padding
  // screenWidth - (horizontalPadding * 2) - (gap * (columns - 1)) / columns
  const itemWidth =
    (SCREEN_WIDTH -
      layout.screenPaddingHorizontal * 2 -
      spacing.md * (columns - 1)) /
    columns

  return (
    <View style={[styles.grid, style]}>
      {items.map((item, index) => (
        <Card
          key={index}
          style={StyleSheet.flatten([
            styles.gridItem,
            { width: itemWidth, backgroundColor: theme.surface },
          ])}
        >
          <TouchableOpacity
            style={styles.touchable}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color + '20' }, // Add 20 for ~12% opacity
              ]}
            >
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <Text
              variant="body"
              style={{
                marginTop: spacing.sm,
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    alignItems: 'center',
    padding: spacing.lg,
    justifyContent: 'center',
  },
  touchable: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
