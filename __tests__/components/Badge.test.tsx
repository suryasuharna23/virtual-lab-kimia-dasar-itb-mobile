import React from 'react'
import { render } from '@testing-library/react-native'
import { Badge } from '@/components/ui/Badge'

// Mock ThemeProvider
const mockTheme = {
  primary: '#1E1B4B',
  primarySoft: '#EDE9FE',
  accent: '#F59E0B',
  accentSoft: '#FEF3C7',
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}))

describe('Badge', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Badge>New</Badge>)
    expect(getByText('New')).toBeTruthy()
  })
})
