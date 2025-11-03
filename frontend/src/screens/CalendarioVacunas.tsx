// frontend/src/screens/CalendarioVacunas.tsx
import React from 'react';
import { View, Text, ScrollView, Platform, Image } from 'react-native';

export default function CalendarioVacunas() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f1f5f9' }}
      contentContainerStyle={{ padding: 16 }}
    >
      <View
        style={{
          borderRadius: 16,
          backgroundColor: '#ffffff',
          padding: 18,
          borderWidth: Platform.OS === 'web' ? 1 : 0,
          borderColor: '#e2e8f0',
          ...(Platform.OS === 'web'
            ? { boxShadow: '0 10px 25px rgba(15,23,42,0.08)' }
            : {
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }),
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: 4,
          }}
        >
          Calendario de vacunas
        </Text>
        <Text style={{ color: '#64748b', marginBottom: 16 }}>
          Acá podés ver el calendario recomendado para perros y gatos.
        </Text>

        {/* BLOQUE PERROS */}
        <View
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: '#ecfeff',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: 8,
            }}
          >
            🐶 Calendario de vacunas – Perros
          </Text>

          {/* Imagen PERROS */}
          <View
            style={{
              height: 260,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#bae6fd',
              backgroundColor: '#e0f2fe',
              overflow: 'hidden',
            }}
          >
            <Image
              // 👉 CAMBIÁ el nombre si tu archivo se llama distinto
              source={require('../assets/calendario-perros.png')}
              resizeMode="contain"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        </View>

        {/* BLOQUE GATOS */}
        <View
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: '#fefce8',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: 8,
            }}
          >
            🐱 Calendario de vacunas – Gatos
          </Text>

          {/* Imagen GATOS */}
          <View
            style={{
              height: 260,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#ffffffff',
              backgroundColor: '#ffedd5',
              overflow: 'hidden',
            }}
          >
            <Image
              // 👉 CAMBIÁ el nombre si tu archivo se llama distinto
              source={require('../assets/calendario-gatos.png')}
              resizeMode="contain"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
