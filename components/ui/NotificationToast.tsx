import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  message: string;
  visible: boolean;
  onHide?: () => void;
}

export const NotificationToast: React.FC<NotificationProps> = ({ type, message, visible, onHide }) => {
  const { theme } = useTheme();
  const iconMap = {
    success: { name: 'checkmark-circle', color: '#22C55E' },
    error: { name: 'close-circle', color: '#DC2626' },
    info: { name: 'information-circle', color: theme.primary },
    warning: { name: 'warning', color: '#F59E42' },
  };
  if (!visible) return null;
  return (
    <Animated.View style={[styles.toast, { backgroundColor: theme.surfaceElevated, borderLeftColor: iconMap[type].color, shadowColor: theme.textPrimary }]}> 
      <Ionicons name={iconMap[type].name as any} size={22} color={iconMap[type].color} style={{ marginRight: 10 }} />
      <Text style={[styles.text, { color: theme.textPrimary }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderLeftWidth: 5,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});

export default NotificationToast;
