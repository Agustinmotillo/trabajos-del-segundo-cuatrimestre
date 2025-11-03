// frontend/src/screens/Home.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

function Card({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
}) {
  const onEnter = (e: any) => {
    if (Platform.OS === 'web') e.currentTarget.style.transform = 'translateY(-4px)';
  };
  const onLeave = (e: any) => {
    if (Platform.OS === 'web') e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      // @ts-ignore
      onMouseEnter={onEnter}
      // @ts-ignore
      onMouseLeave={onLeave}
      style={{
        flexGrow: 1,
        flexBasis: 340,
        maxWidth: 420,
        minHeight: 150,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        justifyContent: 'center',
        shadowColor: '#0f172a',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
        // @ts-ignore
        transition: 'transform .18s ease, box-shadow .18s ease',
        // @ts-ignore
        boxShadow: '0 6px 18px rgba(15, 23, 42, .08)',
        borderWidth: 1,
        borderColor: '#e6f4ee',
      }}
    >
      {!!icon && (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e9fbf5',
            marginBottom: 10,
            borderWidth: 1,
            borderColor: '#c7f3e6',
          }}
        >
          <Text style={{ fontSize: 24 }}>{icon}</Text>
        </View>
      )}
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 }}>
        {title}
      </Text>
      {!!subtitle && <Text style={{ color: '#64748b' }}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();

  const nombre = useMemo(() => user?.name?.split(' ')[0] || 'Usuario', [user]);
  const isWide = width >= 1100;

  // ------- helpers de navegación -------
  const getRouteNames = (): string[] => {
    const state = nav.getState?.();
    return (state as any)?.routeNames
      ? ((state as any).routeNames as string[])
      : ((state as any)?.routes?.map((r: any) => r.name) ?? []);
  };

  const navigateToTurnos = () => {
    const names = getRouteNames();
    const target =
      ['Turnos', 'Turnos (Recepción)', 'Turnos (Vet)'].find((n) => names.includes(n)) || 'Turnos';
    nav.navigate(target as never);
  };

  const navigateToMascotas = () => {
    const names = getRouteNames();
    const target =
      ['Mis Mascotas', 'Todas las Mascotas'].find((n) => names.includes(n)) || 'Mis Mascotas';
    nav.navigate(target as never);
  };

  const navigateToCalendario = () => {
    const names = getRouteNames();
    if (names.includes('Calendario de vacunas')) {
      nav.navigate('Calendario de vacunas' as never);
    }
  };
  // -------------------------------------

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#f6faf9',
        ...(Platform.OS === 'web' ? ({ height: '100vh', overflowY: 'auto' } as any) : {}),
      }}
      contentContainerStyle={Platform.OS !== 'web' ? { paddingBottom: 28 } : undefined}
    >
      {Platform.OS === 'web' && (
        <View
          // @ts-ignore
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            // @ts-ignore
            backgroundImage:
              'radial-gradient(16px 16px at 16px 16px, rgba(66,186,150,.08) 1px, transparent 1px)',
            // @ts-ignore
            backgroundSize: '40px 40px',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Hero de bienvenida */}
      <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingBottom: 18, paddingTop: 8 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: '800',
            color: '#0f172a',
            letterSpacing: 0.2,
            textAlign: 'center',
          }}
        >
          Hola, {nombre} <Text>👋</Text>
        </Text>
        <Text style={{ marginTop: 6, color: '#475569', fontSize: 14, textAlign: 'center' }}>
          Cuidemos a tus mascotas con turnos simples y claros.
        </Text>
      </View>

      {/* Grid */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 18,
          justifyContent: isWide ? 'space-between' : 'center',
        }}
      >
        <Card
          title="Mis Mascotas"
          subtitle="Gestión de tus mascotas"
          icon="🐾"
          onPress={navigateToMascotas}
        />

        <Card
          title="Turnos"
          subtitle="Solicitá y consultá tus turnos"
          icon="📅"
          onPress={navigateToTurnos}
        />

        {/* Calendario de vacunas (YA no hay 'Noticias') */}
        <Card
          title="Calendario de vacunas"
          subtitle="Perros y gatos (guía rápida)"
          icon="💉"
          onPress={navigateToCalendario}
        />
      </View>

      {/* CTA inferior */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' }}>
        <Text
          style={{
            backgroundColor: '#e9fbf5',
            borderColor: '#bdf0e0',
            borderWidth: 1,
            color: '#115e59',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            fontSize: 14,
            textAlign: 'center',
            maxWidth: 820,
          }}
        >
          ¿Primera vez acá? Creá tus mascotas y reservá tu primer turno en minutos.
        </Text>
      </View>
    </ScrollView>
  );
}
