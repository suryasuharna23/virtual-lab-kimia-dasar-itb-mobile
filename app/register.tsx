import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Lengkapi data', 'Semua kolom wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Periksa password', 'Password dan konfirmasi tidak sama.');
      return;
    }

    // TODO: Replace with real registration flow
    Alert.alert('Daftar', 'Registrasi berhasil (dummy).');
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Daftar
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Buat akun baru untuk mengakses Virtual Lab Kimia.
        </ThemedText>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            placeholderTextColor="rgba(255,255,255,0.6)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Password</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Konfirmasi Password</ThemedText>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            style={styles.input}
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={handleRegister}>
          <ThemedText style={styles.primaryButtonText}>Daftar</ThemedText>
        </Pressable>

        <Pressable style={styles.linkRow} onPress={() => router.push('/login')}>
          <ThemedText style={styles.linkText}>Sudah punya akun?</ThemedText>
          <ThemedText style={[styles.linkText, styles.linkEmphasis]}> Masuk</ThemedText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1D3C',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0B1D3C',
    fontWeight: '700',
    fontSize: 16,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  linkText: {
    color: 'rgba(255,255,255,0.8)',
  },
  linkEmphasis: {
    fontWeight: '700',
  },
});
