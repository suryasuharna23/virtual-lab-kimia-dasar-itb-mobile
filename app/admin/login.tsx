import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card } from '@/components/ui';

export default function AdminLoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // TODO: Implement admin login logic

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '800', marginBottom: 24, textAlign: 'center' }}>
          Login Asisten/Admin
        </Text>
        <Card style={{ ...styles.card, backgroundColor: theme.surface }}> 
          {/* TODO: Replace with Input and Button components for admin login */}
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Halaman login khusus asisten/admin. (Form login admin belum diimplementasi)
          </Text>
        </Card>
        <TouchableOpacity style={{ marginTop: 32 }} onPress={() => router.replace('/auth-selection')}>
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
          <Text style={{ color: theme.primary, marginLeft: 8 }}>Kembali ke Pilihan Peran</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    elevation: 3,
  },
});
