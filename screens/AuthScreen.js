import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmail, signUpWithEmail } from '../services/auth';

function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    try {
      setLoading(true);
      await signUpWithEmail(email.trim(), password);
      Alert.alert('Success', 'Check your email for the confirmation link!');
    } catch (err) {
      setError(err?.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError('');
    try {
      setLoading(true);
      await signInWithEmail(email.trim(), password);
      navigation.navigate('Home');
    } catch (err) {
      setError(err?.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DJ Set Tracker</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        onChangeText={setEmail}
        autoCapitalize="none"
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#33498e', opacity: loading ? 0.7 : 1 }]}
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#555', opacity: loading ? 0.7 : 1 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12, color: '#000' },
  button: { paddingVertical: 14, borderRadius: 8, marginVertical: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default AuthScreen;
