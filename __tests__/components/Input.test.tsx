import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Input } from '@/components/ui/Input'

// Mock ThemeProvider
const mockTheme = {
  primary: '#1E1B4B',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  textSecondary: '#6B7280',
  textPrimary: '#1E1B4B',
  textMuted: '#9CA3AF',
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}))

describe('Input', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    )
    expect(getByPlaceholderText('Enter text')).toBeTruthy()
  })

  it('renders label and error', () => {
    const { getByText } = render(
      <Input label="Username" error="Invalid username" />
    )
    expect(getByText('Username')).toBeTruthy()
    expect(getByText('Invalid username')).toBeTruthy()
  })

  it('handles focus and blur', () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    const { getByPlaceholderText } = render(
      <Input placeholder="Input" onFocus={onFocus} onBlur={onBlur} />
    )

    fireEvent(getByPlaceholderText('Input'), 'focus')
    expect(onFocus).toHaveBeenCalled()

    fireEvent(getByPlaceholderText('Input'), 'blur')
    expect(onBlur).toHaveBeenCalled()
  })
})
