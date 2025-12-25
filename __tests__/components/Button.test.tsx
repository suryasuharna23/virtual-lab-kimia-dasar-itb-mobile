import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '@/components/ui/Button'

// Mock ThemeProvider
const mockTheme = {
  primary: '#1E1B4B',
  primarySoft: '#EDE9FE',
  accent: '#F59E0B',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  primaryLight: '#3730A3',
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme, isDark: false }),
}))

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Press Me</Button>)
    expect(getByText('Press Me')).toBeTruthy()
  })

  it('triggers onPress when pressed', () => {
    const onPress = jest.fn()
    const { getByText } = render(<Button onPress={onPress}>Press Me</Button>)
    fireEvent.press(getByText('Press Me'))
    expect(onPress).toHaveBeenCalled()
  })

  it('does not trigger onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByText } = render(
      <Button disabled onPress={onPress}>
        Disabled
      </Button>
    )
    fireEvent.press(getByText('Disabled'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
