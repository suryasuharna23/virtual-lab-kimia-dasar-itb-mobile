import React from 'react'
import { render } from '@testing-library/react-native'
import { Text } from '@/components/ui/Text'
import { fontSize, fontWeight } from '@/constants/theme'

// Mock the ThemeProvider
const mockTheme = {
  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accent: '#F59E0B',
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}))

describe('Text', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Text>Hello World</Text>)
    const textElement = getByText('Hello World')
    expect(textElement).toBeTruthy()
  })

  it('renders with correct variant styles', () => {
    const { getByText } = render(<Text variant="h1">Heading 1</Text>)
    const textElement = getByText('Heading 1')
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: fontSize.h1,
          fontWeight: fontWeight.bold,
        }),
      ])
    )
  })

  it('renders with correct color', () => {
    const { getByText } = render(<Text color="accent">Accent Text</Text>)
    const textElement = getByText('Accent Text')
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: mockTheme.accent,
        }),
      ])
    )
  })

  it('renders with correct alignment', () => {
    const { getByText } = render(<Text align="center">Centered Text</Text>)
    const textElement = getByText('Centered Text')
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          textAlign: 'center',
        }),
      ])
    )
  })
})
