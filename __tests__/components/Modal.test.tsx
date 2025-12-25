import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Modal } from '@/components/ui/Modal'
import { Text } from 'react-native'

// Mock ThemeProvider
const mockTheme = {
  primary: '#1E1B4B',
  surface: '#FFFFFF',
  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
}

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme, isDark: false }),
}))

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

describe('Modal', () => {
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <Modal visible={true} onClose={() => {}} title="Test Modal">
        <Text>Modal Content</Text>
      </Modal>
    )
    expect(getByText('Test Modal')).toBeTruthy()
    expect(getByText('Modal Content')).toBeTruthy()
  })

  it('does not render content when not visible', () => {
    const { queryByText } = render(
      <Modal visible={false} onClose={() => {}} title="Test Modal">
        <Text>Modal Content</Text>
      </Modal>
    )
    expect(queryByText('Test Modal')).toBeNull()
    expect(queryByText('Modal Content')).toBeNull()
  })

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn()
    const { getByLabelText } = render(
      <Modal visible={true} onClose={onClose} title="Test Modal">
        <Text>Content</Text>
      </Modal>
    )
    
    fireEvent.press(getByLabelText('Close modal'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop is pressed', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(
      <Modal visible={true} onClose={onClose} title="Test Modal">
        <Text>Content</Text>
      </Modal>
    )
    
    fireEvent.press(getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
