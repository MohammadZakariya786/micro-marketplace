import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useApp } from '@/context/app-context';

export default function LoginScreen() {
  const router = useRouter();
  const { token, login, register } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (token) return <Redirect href="/(tabs)" />;

  const onSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        setSuccess('Registered successfully. Please login.');
        setIsRegister(false);
        setName('');
      } else {
        await login(email, password);
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>{isRegister ? 'Create account' : 'Sign in'}</Text>

        {isRegister ? (
          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />
        ) : null}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          autoCapitalize="none"
        />

        {success ? <Text style={styles.success}>{success}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isRegister ? 'Register' : 'Login'}</Text>}
        </Pressable>

        <Pressable onPress={() => setIsRegister((prev) => !prev)}>
          <Text style={styles.switchText}>
            {isRegister ? 'Already have an account? Sign in' : 'New here? Create account'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  submitBtn: {
    borderRadius: 10,
    backgroundColor: '#2563eb',
    paddingVertical: 11,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700' },
  switchText: { color: '#1d4ed8', fontWeight: '600', textAlign: 'center', marginTop: 2 },
  error: { color: '#b91c1c', fontWeight: '600' },
  success: {
    color: '#166534',
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    fontWeight: '600',
  },
});
