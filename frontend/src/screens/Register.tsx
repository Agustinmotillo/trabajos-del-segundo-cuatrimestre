// frontend/src/screens/Register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google'; // 👈 NUEVO
import { API_BASE } from '../config';                 // 👈 NUEVO

export default function Register() {
  const { register } = useAuth() as any;
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setErr('');
      setLoading(true);
      await register?.(name, email, password);
      navigation.navigate('Login');
    } catch (e: any) {
      setErr(e?.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // ---- Alta / login con Google (misma lógica que en Login.tsx) ----
  const googleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setErr('');
        setGoogleLoading(true);

        const r = await fetch(`${API_BASE}/auth/google/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });

        const d = await r.json();
        if (!d.ok) throw new Error(d.message || 'Error con Google');

        // guardamos sesión igual que en Login.tsx
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({ user: d.user, token: d.token }));
          localStorage.setItem('user', JSON.stringify(d.user));
          localStorage.setItem('token', d.token);
          window.location.reload();
        }
      } catch (e: any) {
        setErr(e?.message || 'No se pudo crear la cuenta con Google');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setErr('Error al conectar con Google'),
  });

  const handleGoogleRegister = () => {
    googleRegister();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.brand}>🐾 Vet App</Text>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Registrate para empezar</Text>

        <View style={{ gap: 10, width: '100%', marginTop: 12 }}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          {err ? <Text style={styles.error}>{err}</Text> : null}

          {/* Botón verde: registro normal */}
          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.9}
            style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            disabled={loading || googleLoading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Botón Google: crear cuenta / entrar con Google */}
          <TouchableOpacity
            onPress={handleGoogleRegister}
            activeOpacity={0.9}
            style={[
              styles.googleBtn,
              (googleLoading || loading) && { opacity: 0.7 },
            ]}
            disabled={googleLoading || loading}
          >
            <Text style={styles.googleLogo}>G</Text>
            <Text style={styles.googleText}>
              {googleLoading ? 'Conectando…' : 'Crear cuenta con Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            style={{ alignSelf: 'center', marginTop: 6 }}
          >
            <Text style={styles.link}>¿Ya tenés cuenta? Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles: any = {
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#e2e8f0',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 10px 25px rgba(2, 6, 23, 0.08)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }),
    alignItems: 'center',
  },
  brand: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  title: { fontSize: 22, fontWeight: '900', color: '#111827', marginTop: 4 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  inputWrap: {
    width: '100%',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 10,
    opacity: 0.7,
    zIndex: 1,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 38,
    fontSize: 16,
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: '#166534',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  link: { color: '#1d4ed8', fontWeight: '700', fontSize: 13 },
  error: { color: '#b91c1c', fontWeight: '700' },

  // botón Google
  googleBtn: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleLogo: {
    width: 20,
    height: 20,
    borderRadius: 4,
    textAlign: 'center',
    fontWeight: '900',
    color: '#4285F4',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 1,
  },
  googleText: {
    fontWeight: '700',
    color: '#374151',
    fontSize: 14,
  },
};
