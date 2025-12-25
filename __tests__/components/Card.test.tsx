import React from 'react'
import { render } from '@testing-library/react-native'
import { Card } from '@/components/ui/Card'
import { Text } from 'react-native'

// Mock ThemeProvider
const mockTheme = {
  surface: '#FFFFFF',
  primarySoft: '#EDE9FE',
  accentSoft: '#FEF3C7',
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}))

describe('Card', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    )
    expect(getByText('Card Content')).toBeTruthy()
  })
})
