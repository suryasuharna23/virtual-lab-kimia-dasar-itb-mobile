import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Card, Input, Button } from '@/components/ui';

export default function AdminLoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // TODO: Implement admin login logic

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.container}>
        <Text variant="h2" style={{ color: theme.primary, fontWeight: '900', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>
          Login Asisten/Admin
        </Text>
        <Card style={{ ...styles.card, backgroundColor: theme.surface, borderColor: theme.border }}>
          <Input
            label="Email"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Masukkan email admin"
            style={{ marginBottom: 16 }}
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Masukkan password"
            secureTextEntry
            style={{ marginBottom: 16 }}
          />
          <Button
            variant="primary"
            fullWidth
            style={{ marginTop: 8 }}
            onPress={() => { /* TODO: Implement admin login */ }}
          >
            Masuk
          </Button>
        </Card>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/auth-selection')}>
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    elevation: 3,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'center',
  },
});
