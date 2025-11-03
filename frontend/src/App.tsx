// frontend/src/App.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';

import Login from './screens/Login';
import Register from './screens/Register';
import Home from './screens/Home';
import Pets from './screens/Pets';
import Appointments from './screens/Appointments';
import Messages from './screens/Messages';
import VetPanel from './screens/VetPanel';
import PetDetails from './screens/PetDetails';
import Profile from './screens/Profile';
import CalendarioVacunas from './screens/CalendarioVacunas'; // 👈 calendario

import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

/* ---------------- Drawer Content personalizado ---------------- */
function PrettyDrawerContent(props: any) {
  const { user, logout, authFetch } = useAuth();
  const [unread, setUnread] = useState<number>(0);
  const role = user?.role;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const r = await authFetch('/messages/unread/for-me');
        const d = await r.json().catch(() => ({}));
        if (mounted && d?.ok) setUnread(Number(d.total || 0));
      } catch {}
    };

    load();
    const pollId = setInterval(load, 10000);

    const onRead = () => load();
    if (typeof window !== 'undefined') {
      window.addEventListener('messages:read', onRead as any);
    }

    return () => {
      mounted = false;
      clearInterval(pollId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('messages:read', onRead as any);
      }
    };
  }, [authFetch]);

  const Badge = ({ value }: { value: number }) =>
    value > 0 ? (
      <View
        style={{
          marginLeft: 8,
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#ef4444',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 6,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{value}</Text>
      </View>
    ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#ecfeff' }}>
      <TouchableOpacity
        onPress={() => props.navigation?.toggleDrawer()}
        activeOpacity={0.85}
        style={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          // @ts-ignore
          cursor: 'pointer',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#cffafe',
            borderWidth: 1,
            borderColor: '#bae6fd',
          }}
        >
          <Text style={{ fontSize: 22 }}>🐾</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0f172a' }}>Vet App</Text>
          <Text style={{ fontSize: 12, color: '#334155' }}>
            {user?.name ? `Hola, ${user.name.split(' ')[0]}` : 'Bienvenid@'}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: '#e2e8f0', marginHorizontal: 12, opacity: 0.8 }} />

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 8 }}
        style={{ backgroundColor: '#ecfeff' }}
      >
        {props.state.routes.map((route: any, i: number) => {
          if (route.name === 'Ficha Mascota' && role === 'VETERINARIO') {
            return null;
          }

          const focused = i === props.state.index;
          const label: string = props.descriptors[route.key].options.title ?? route.name;
          const isMessagesItem =
            label.startsWith('Mensajes') || label.startsWith('Mensajes (Client');

          return (
            <DrawerItem
              key={route.key}
              label={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontWeight: focused ? '800' : '700',
                      color: focused ? '#0f766e' : '#334155',
                      fontSize: 15,
                    }}
                  >
                    {label}
                  </Text>
                  {isMessagesItem && <Badge value={unread} />}
                </View>
              )}
              onPress={() => props.navigation.navigate(route.name)}
              icon={props.descriptors[route.key].options.drawerIcon}
              focused={focused}
            />
          );
        })}
      </DrawerContentScrollView>

      <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
        <TouchableOpacity
          onPress={logout}
          activeOpacity={0.9}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#fee2e2',
            borderWidth: 1,
            borderColor: '#fecaca',
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ fontSize: 16 }}>↪️</Text>
          <Text style={{ fontWeight: '700', color: '#991b1b' }}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 11, color: '#64748b', marginTop: 8, textAlign: 'center' }}>
          v1.0 • Clínica Felina & Canina
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Drawer con roles e íconos ---------------- */
function DrawerRoutes() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(p) => <PrettyDrawerContent {...p} />}
      screenOptions={{
        headerTitleAlign: 'left',
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '800' },
        drawerType: 'front',
        drawerStyle: {
          width: 260,
          backgroundColor: '#ecfeff',
          borderRightWidth: 1,
          borderRightColor: '#e2e8f0',
        },
        drawerActiveTintColor: '#0f766e',
        drawerInactiveTintColor: '#334155',
        drawerActiveBackgroundColor: '#ccfbf1',
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '700',
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Home',
          drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
        }}
      />

      {role === 'CLIENTE' && (
        <>
          <Drawer.Screen
            name="Mis Mascotas"
            component={Pets}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🐾</Text> }}
          />
          <Drawer.Screen
            name="Turnos"
            component={Appointments}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📅</Text> }}
          />
          <Drawer.Screen
            name="Calendario de vacunas"
            component={CalendarioVacunas}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💉</Text> }}
          />
          <Drawer.Screen
            name="Mensajes"
            component={Messages}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💬</Text> }}
          />
        </>
      )}

      {role === 'RECEPCIONISTA' && (
        <>
          <Drawer.Screen
            name="Mis Mascotas"
            component={Pets}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🐾</Text> }}
          />
          <Drawer.Screen
            name="Turnos (Recepción)"
            component={Appointments}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📅</Text> }}
          />
          {/* 👇 AHORA TAMBIÉN PARA RECEPCIONISTA */}
          <Drawer.Screen
            name="Calendario de vacunas"
            component={CalendarioVacunas}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💉</Text> }}
          />
          <Drawer.Screen
            name="Mensajes (Clientes)"
            component={Messages}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💬</Text> }}
          />
        </>
      )}

      {role === 'VETERINARIO' && (
        <>
          <Drawer.Screen
            name="Mis Mascotas"
            component={Pets}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🐾</Text> }}
          />
          <Drawer.Screen
            name="Turnos (Vet)"
            component={Appointments}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📅</Text> }}
          />
          {/* 👇 AHORA TAMBIÉN PARA VETERINARIO */}
          <Drawer.Screen
            name="Calendario de vacunas"
            component={CalendarioVacunas}
            options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💉</Text> }}
          />
          {/* Ruta oculta en el menú */}
          <Drawer.Screen
            name="Ficha Mascota"
            component={PetDetails}
            options={{
              drawerItemStyle: { display: 'none' },
              drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🐾</Text>,
            }}
          />
        </>
      )}

      <Drawer.Screen
        name="Perfil"
        component={Profile}
        options={{ drawerIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text> }}
      />
    </Drawer.Navigator>
  );
}

/* ---------------- Root Navigator (login/register vs. app) ---------------- */
function RootNavigator() {
  const { user, hydrated } = useAuth();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Cargando…</Text>
      </View>
    );
  }

  return user ? (
    <DrawerRoutes />
  ) : (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId="813965313415-bnqo1j4uour05hiai6am7pebk145ohqn.apps.googleusercontent.com">
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}
