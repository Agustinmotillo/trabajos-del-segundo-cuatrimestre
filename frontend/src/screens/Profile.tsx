// frontend/src/screens/Profile.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
        Perfil
      </Text>

      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: '700' }}>Nombre</Text>
        <Text style={{ marginBottom: 8 }}>{user?.name}</Text>

        <Text style={{ fontWeight: '700' }}>Email</Text>
        <Text style={{ marginBottom: 8 }}>{user?.email}</Text>

        <Text style={{ fontWeight: '700' }}>Rol</Text>
        <Text>{user?.role}</Text>
      </View>

      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: '#c62828',
          padding: 14,
          borderRadius: 10,
          marginTop: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}
