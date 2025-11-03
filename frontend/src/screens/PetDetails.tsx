import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function PetDetails() {
  const { authFetch, user } = useAuth();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const petId = Number(route.params?.petId);

  const [data, setData] = useState<any>(null);
  const [note, setNote] = useState('');
  const [vaccine, setVaccine] = useState('');
  const role = user?.role;

  const load = async () => {
    const r = await authFetch(`/pets/${petId}/records`);
    const d = await r.json().catch(() => ({}));
    setData(d?.ok ? d : null);
  };

  useEffect(() => { if (petId) load(); }, [petId]);

  const addRecord = async () => {
    const noteTrim = note.trim();
    const vacTrim  = vaccine.trim();
    if (!noteTrim && !vacTrim) return;

    await authFetch(`/pets/${petId}/records`, {
      method: 'POST',
      body: JSON.stringify({
        type: vacTrim ? 'VACUNA' : 'NOTA',
        description: noteTrim,
        vaccine: vacTrim || undefined,
      }),
    });
    setNote(''); setVaccine('');
    load();
  };

  const goBackSafe = () => {
    navigation.navigate('Mis Mascotas' as never);
  };

  if (!petId) {
    return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Sin ID de mascota.</Text></View>;
  }
  if (!data) {
    return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Cargando…</Text></View>;
  }

  const pet = data.pet;
  const history = data.records || [];
  const appts = data.appointments || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header centrado + Volver */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          paddingVertical: 10,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            maxWidth: 900,
            width: '100%',
            alignSelf: 'center',
            position: 'relative',
            minHeight: 40,
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity
            onPress={goBackSafe}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              alignSelf: 'flex-start',
              height: 36,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: '#16a34a',
              justifyContent: 'center',
              zIndex: 2, // <<< asegura que quede arriba
              ...(Platform.OS === 'web'
                ? {}
                : {
                    shadowColor: '#000',
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                  }),
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>Volver</Text>
          </TouchableOpacity>

          {/* pointerEvents evita que el título “tape” el botón en web */}
          <Text
  // evita que tape el botón en web
  style={{
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 18,
    color: '#0f172a',
    // RN Web: usar style.pointerEvents en lugar del prop
    pointerEvents: 'none' as any,   // <- esto quita el error de TS
  }}
>
  Ficha Mascota
</Text>

        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
        <View style={{ maxWidth: 900, width: '100%', alignSelf: 'center', paddingHorizontal: 12 }}>
          {/* Datos básicos */}
          <View style={{ padding: 12, borderWidth: 1, borderRadius: 10, borderColor: '#e2e8f0', backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{pet.name} ({pet.species})</Text>
            {(pet.owner_name || pet.owner_email) && (
              <Text style={{ color: '#475569' }}>
                Dueño: {pet.owner_name || '-'}{pet.owner_email ? ` — ${pet.owner_email}` : ''}
              </Text>
            )}
            <Text>Raza: {pet.breed || '-'} • Edad: {pet.age ?? '-'}</Text>
          </View>

          {/* Form veterinario */}
          {role === 'VETERINARIO' && (
            <View
              style={{
                marginTop: 12,
                padding: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#e2e8f0',
                backgroundColor: '#fff',
                gap: 8,
              }}
            >
              <Text style={{ fontWeight: '800' }}>Nueva entrada clínica</Text>
              <TextInput
                placeholder="Nota / diagnóstico"
                value={note}
                onChangeText={setNote}
                style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10 }}
              />
              <TextInput
                placeholder="Vacuna (opcional)"
                value={vaccine}
                onChangeText={setVaccine}
                style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10 }}
              />
              <TouchableOpacity
                onPress={addRecord}
                activeOpacity={0.9}
                style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 10 }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>
                  Guardar registro
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Historial */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '800', marginBottom: 6 }}>Historial clínico</Text>
            {history.length === 0 ? (
              <Text style={{ color: '#64748b' }}>Sin registros.</Text>
            ) : (
              history.map((r: any) => (
                <View
                  key={r.id}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontWeight: '700' }}>
                    {r.type}{r.vet_name ? ` • ${r.vet_name}` : ''} • {new Date(r.created_at).toLocaleString()}
                  </Text>
                  <Text>{r.description}</Text>
                </View>
              ))
            )}
          </View>

          {/* Turnos */}
          <View style={{ marginTop: 12, marginBottom: 24 }}>
            <Text style={{ fontWeight: '800', marginBottom: 6 }}>Turnos</Text>
            {appts.length === 0 ? (
              <Text style={{ color: '#64748b' }}>Sin turnos.</Text>
            ) : (
              appts.map((t: any) => (
                <View
                  key={t.id}
                  style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontWeight: '700' }}>{new Date(t.date).toLocaleString()}</Text>
                  <Text>{t.status ? `Estado: ${t.status}` : ''}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
