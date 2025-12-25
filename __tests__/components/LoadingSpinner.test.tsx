import React from 'react'
import { render } from '@testing-library/react-native'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Mock ThemeProvider
const mockTheme = {
  primary: '#1E1B4B',
  border: '#E5E7EB',
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}))

describe('LoadingSpinner', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<LoadingSpinner />)
    expect(toJSON()).toBeTruthy()
  })
})
