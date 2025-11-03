// frontend/src/screens/Pets.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Pets(){
  const { user, authFetch } = useAuth();
  const navigation = useNavigation<any>();
  const [items,setItems] = useState<any[]>([]);
  const [form,setForm] = useState({name:'', species:'Perro', breed:'', age:''});

  // 🔎 búsqueda (recep/vet)
  const [query, setQuery] = useState('');

  const load = async ()=>{
    if (user?.role === 'CLIENTE') {
      const r = await authFetch('/pets/my'); const d = await r.json(); setItems(d.items || []);
    } else if (user?.role === 'RECEPCIONISTA' || user?.role === 'VETERINARIO') {
      // 👈 FIX: usar /pets/all (tu backend actual)
      const r = await authFetch('/pets/all'); 
      const d = await r.json(); 
      setItems(d.items || []);
    }
  };

  useEffect(()=>{ load(); }, [user?.role]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it:any) => String(it.name || '').toLowerCase().includes(q));
  }, [items, query]);

  if (user?.role === 'RECEPCIONISTA' || user?.role === 'VETERINARIO') {
    return (
      <View style={{flex:1}}>
        <View style={{ paddingHorizontal:12, paddingTop:8 }}>
          <View style={{ position:'relative', maxWidth:380 }}>
            <Text style={{ position:'absolute', left:12, top:10, opacity:0.6 }}>🔎</Text>
            <TextInput
              placeholder="Buscar por nombre…"
              value={query}
              onChangeText={setQuery}
              style={{ borderWidth:1, borderRadius:10, paddingVertical:8, paddingLeft:36, paddingRight:36, backgroundColor:'#fff' }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={()=> setQuery('')} style={{ position:'absolute', right:8, top:6, padding:6, borderRadius:8 }}>
                <Text style={{ opacity:0.5 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          style={{flex:1, padding:12}}
          data={filtered}
          keyExtractor={(it)=>String(it.id)}
          ListEmptyComponent={<Text style={{ color:'#64748b', padding:12 }}>{query ? 'No hay mascotas que coincidan con la búsqueda.' : 'Sin mascotas.'}</Text>}
          renderItem={({item})=>(
            <TouchableOpacity
              onPress={()=> navigation.navigate('Ficha Mascota', { petId: item.id })}
              activeOpacity={0.8}
              style={{padding:12, borderWidth:1, borderRadius:10, marginBottom:10}}
            >
              <Text style={{fontWeight:'700'}}>{item.name} ({item.species})</Text>
              <Text>Dueño: {item.owner_name} — {item.owner_email}</Text>
              <Text>Raza: {item.breed || '-'}, Edad: {item.age || '-'}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // Vista cliente sin cambios…
  return (
    <View style={{flex:1, padding:12, gap:10}}>
      {user?.role==='CLIENTE' && (<View style={{gap:8}}>
        <Text style={{fontWeight:'700'}}>Agregar Mascota</Text>
        <TextInput placeholder="Nombre" value={form.name} onChangeText={(v)=>setForm({...form,name:v})} style={{borderWidth:1,padding:10,borderRadius:8}}/>
        <TextInput placeholder="Especie" value={form.species} onChangeText={(v)=>setForm({...form,species:v})} style={{borderWidth:1,padding:10,borderRadius:8}}/>
        <TextInput placeholder="Raza" value={form.breed} onChangeText={(v)=>setForm({...form,breed:v})} style={{borderWidth:1,padding:10,borderRadius:8}}/>
        <TextInput placeholder="Edad" value={form.age} onChangeText={(v)=>setForm({...form,age:v})} style={{borderWidth:1,padding:10,borderRadius:8}}/>
        <TouchableOpacity
          onPress={async()=>{
            await authFetch('/pets', { method:'POST', body:JSON.stringify({ ...form, age: form.age ? Number(form.age) : null }) });
            setForm({name:'',species:'Perro',breed:'',age:''}); 
            load();
          }}
          style={{backgroundColor:'#2e7d32', padding:12, borderRadius:10}}
        >
          <Text style={{color:'#fff', textAlign:'center'}}>Guardar Mascota</Text>
        </TouchableOpacity>
      </View>)}

      <Text style={{fontSize:18, marginTop:8}}>Mis Mascotas</Text>
      <FlatList
        data={items}
        keyExtractor={(it)=>String(it.id)}
        renderItem={({item})=>(
          <View style={{padding:12, borderWidth:1, borderRadius:10, marginVertical:6}}>
            <Text style={{fontWeight:'700'}}>{item.name} ({item.species})</Text>
            <Text>Raza: {item.breed || '-'}, Edad: {item.age || '-'}</Text>
          </View>
        )}
      />
    </View>
  );
}
