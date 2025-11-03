import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Platform, View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

type Pet = { id:number; name:string; species?:string };

const fmtDate = (d: string) => {
  try {
    if (!d) return '';
    const iso = new Date(d);
    if (!isNaN(iso.getTime())) {
      return iso.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const [y, m, day] = d.split('T')[0].split('-');
    if (y && m && day) return `${day}/${m}/${y}`;
    return d;
  } catch { return d; }
};

const fmtTime = (t: string) => {
  if (!t) return '';
  const m = t.match(/^(\d{2}:\d{2})/);
  return m ? m[1] : t;
};

function makeSlots() {
  const slots:string[] = [];
  let h = 8, m = 0;
  while (h < 17 || (h === 17 && m === 0)) {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    m += 20;
    if (m >= 60) { m = 0; h++; }
  }
  return slots;
}
const ALL_SLOTS = makeSlots();

export default function Appointments(){
  const { user, authFetch } = useAuth();
  const role = user?.role;
  const [items,setItems] = useState<any[]>([]);

  // ------ Estado para CLIENTE ------
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [timeOpen, setTimeOpen] = useState<boolean>(false);
  const [reason, setReason] = useState('');
  const [booked, setBooked] = useState<string[]>([]);
  const [err, setErr] = useState('');

  const freeSlots = useMemo(
    () => ALL_SLOTS.map(t => ({ time: t, taken: booked.includes(t) })),
    [booked]
  );

  // Carga según rol (=> dependemos de role)
  const load = useCallback(async ()=> {
    if(role==='CLIENTE'){
      const [r1, r2] = await Promise.all([
        authFetch('/appointments/my').then(r=>r.json()),
        authFetch('/pets/my').then(r=>r.json()),
      ]);
      setItems(r1.items || []);
      setPets(r2.items || []);
    }else if(role==='RECEPCIONISTA'){
      const r = await authFetch('/appointments/pending'); const d = await r.json(); setItems(d.items||[]);
    }else if(role==='VETERINARIO'){
      const r = await authFetch('/appointments/for-vet'); const d = await r.json(); setItems(d.items||[]);
    }else{
      setItems([]);
    }
  }, [role, authFetch]);

  useEffect(()=> {
    if (!role) return;
    load();
    // Polling SOLO para VETERINARIO
    if (role === 'VETERINARIO') {
      const id = setInterval(load, 10000);
      return () => clearInterval(id);
    }
  }, [role, load]);

  // 🔁 Recargar cada vez que la pantalla se ENFOCA (vuelve desde otra vista)
  useFocusEffect(
    useCallback(() => {
      if (!role) return;
      load();
    }, [role, load])
  );

  // Traer horarios ocupados cuando cambia la fecha
  useEffect(()=> {
    (async()=> {
      if (!date) { setBooked([]); return; }
      const r = await authFetch(`/appointments/booked?date=${encodeURIComponent(date)}`);
      const d = await r.json();
      setBooked(d.ok ? (d.times || []) : []);
      setTime('');
      setTimeOpen(false);
    })();
  }, [date, authFetch]);

  // ---------- VISTA CLIENTE ----------
  if(role==='CLIENTE'){
    const DateInput = (
      <View style={{ position:'relative', borderWidth:1, borderRadius:8, overflow:'hidden' }}>
        {Platform.OS === 'web' ? (
          <>
            <style
              // @ts-ignore
              dangerouslySetInnerHTML={{
                __html: `
                  input[type="date"]::-webkit-calendar-picker-indicator { opacity:0; display:none; }
                  input[type="date"] { background-color:#fff; }
                `,
              }}
            />
            {/* @ts-ignore */}
            <input
              id="date-input"
              type="date"
              style={{
                width:'100%',
                padding:10,
                paddingRight:42,
                border:0,
                outline:'none',
                background:'white'
              }}
              value={date}
              onChange={(e:any)=> setDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
            <button
              type="button"
              onClick={()=> {
                const el = document.getElementById('date-input') as any;
                if (el?.showPicker) el.showPicker(); else el?.focus();
              }}
              style={{
                position:'absolute',
                right:0, top:0, height:'100%', width:40,
                border:'none', background:'transparent', cursor:'pointer'
              }}
              aria-label="Abrir calendario"
              title="Abrir calendario"
            >
              📅
            </button>
          </>
        ) : (
          <TextInput
            placeholder="Fecha (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            style={{ padding:10 }}
          />
        )}
      </View>
    );

    const SelectWeb = ({ value, onChange, options }:{
      value:string, onChange:(v:string)=>void, options:{label:string, value:string, disabled?:boolean}[]
    }) => (
      // @ts-ignore
      <select
        value={value}
        onChange={(e:any)=> onChange(e.target.value)}
        style={{ width:'100%', padding:10, borderWidth:1, borderRadius:8 }}
      >
        {options.map(op=>(
          <option key={op.value} value={op.value} disabled={op.disabled}>
            {op.label}
          </option>
        ))}
      </select>
    );

    return (
      <View style={{flex:1, padding:12, gap:8}}>
        <Text style={{fontWeight:'700'}}>Sacar Turno</Text>

        {Platform.OS === 'web' ? (
          <SelectWeb
            value={petId}
            onChange={setPetId}
            options={[
              { label:'Elegí una mascota', value:'' },
              ...pets.map(p=>({ label: p.name, value:String(p.id) }))
            ]}
          />
        ) : (
          <TextInput
            placeholder="Mascota"
            value={petId}
            onChangeText={setPetId}
            style={{borderWidth:1,padding:10,borderRadius:8}}
          />
        )}

        {DateInput}

        <View style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={()=> setTimeOpen(v => !v)}
            activeOpacity={0.8}
            style={{
              borderWidth:1, borderRadius:8, paddingVertical:10, paddingHorizontal:12,
              flexDirection:'row', justifyContent:'space-between', alignItems:'center'
            }}
          >
            <Text style={{ color: time ? '#111' : '#6b7280' }}>
              {time ? fmtTime(time) : 'Elegí un horario'}
            </Text>
            <Text style={{ opacity:0.6 }}>{timeOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>

          {timeOpen && (
            <View
              style={{
                borderWidth:1, borderRadius:10, padding:10, marginTop:6,
                backgroundColor:'#fff'
              }}
            >
              <Text style={{ marginBottom:8, fontWeight:'600' }}>Horarios disponibles</Text>

              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
                {freeSlots.map((s) => {
                  const isTaken = s.taken;
                  const isSelected = time === s.time;
                  const bg = isTaken ? '#c62828' : isSelected ? '#1b5e20' : '#2e7d32';

                  return (
                    <TouchableOpacity
                      key={s.time}
                      disabled={isTaken}
                      onPress={() => { setTime(s.time); setTimeOpen(false); }}
                      style={{
                        backgroundColor: bg,
                        opacity: isTaken ? 0.7 : 1,
                        paddingVertical:10, paddingHorizontal:14,
                        borderRadius: 8,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? '#0d3a16' : 'transparent'
                      }}
                    >
                      <Text style={{ color:'#fff', fontWeight:'600' }}>{s.time}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ color:'#6b7280', fontSize:12, marginTop:8 }}>
                Verde: disponible • Rojo: ocupado
              </Text>
            </View>
          )}
        </View>

        <TextInput
          placeholder="Motivo (vacuna / control / etc.)"
          value={reason}
          onChangeText={setReason}
          style={{borderWidth:1,padding:10,borderRadius:8}}
        />

        {err ? <Text style={{color:'#c62828'}}>{err}</Text> : null}

        <TouchableOpacity
          onPress={async()=> {
            try{
              if (!petId)  return setErr('Elegí una mascota');
              if (!date)   return setErr('Elegí una fecha');
              if (!time)   return setErr('Elegí un horario');
              setErr('');
              await authFetch('/appointments', {
                method:'POST',
                body: JSON.stringify({ pet_id: Number(petId), date, time, reason })
              });
              setReason('');
              setPetId('');
              await load();
              const r = await authFetch(`/appointments/booked?date=${encodeURIComponent(date)}`);
              const d = await r.json();
              setBooked(d.ok ? (d.times || []) : []);
              setTime('');
              setTimeOpen(false);
            }catch(e:any){
              setErr(e.message || 'No se pudo crear el turno');
            }
          }}
          style={{backgroundColor:'#2e7d32', padding:12, borderRadius:10}}
        >
          <Text style={{color:'#fff', textAlign:'center'}}>Enviar</Text>
        </TouchableOpacity>

        <Text style={{fontSize:18, marginTop:10}}>Mis Turnos</Text>
        <FlatList
          data={items}
          keyExtractor={(it)=>String(it.id)}
          renderItem={({item})=>(
            <View style={{padding:10, borderWidth:1, borderRadius:10, marginVertical:6}}>
              <Text>{fmtDate(item.date)} • {fmtTime(item.time)} • {item.reason}</Text>
              <Text>Estado: {item.status}</Text>
            </View>
          )}
        />
      </View>
    );
  }

  // ---------- RECEPCIONISTA ----------
  if(role==='RECEPCIONISTA'){
    const refresh = async ()=> {
      const r=await authFetch('/appointments/pending'); const d=await r.json(); setItems(d.items||[]);
    };
    return (
      <FlatList
        style={{flex:1,padding:12}}
        data={items}
        keyExtractor={(it)=>String(it.id)}
        renderItem={({item})=>(
          <View style={{padding:12,borderWidth:1,borderRadius:10, marginBottom:10}}>
            <Text>{fmtDate(item.date)} • {fmtTime(item.time)} • {item.reason}</Text>
            <Text>Mascota: {item.pet_name} — Dueño: {item.owner_name}</Text>
            <View style={{flexDirection:'row', gap:8, marginTop:8}}>
              <TouchableOpacity
                onPress={async()=>{ await authFetch(`/appointments/${item.id}/status`, {method:'PATCH', body:JSON.stringify({status:'ACEPTADO'})}); refresh(); }}
                style={{backgroundColor:'#2e7d32', padding:10, borderRadius:8}}
              >
                <Text style={{color:'#fff'}}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async()=>{ await authFetch(`/appointments/${item.id}/status`, {method:'PATCH', body:JSON.stringify({status:'RECHAZADO'})}); refresh(); }}
                style={{backgroundColor:'#c62828', padding:10, borderRadius:8}}
              >
                <Text style={{color:'#fff'}}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  }

  // ---------- VETERINARIO ----------
  const refreshVet = async ()=> {
    const r = await authFetch('/appointments/for-vet'); const d = await r.json(); setItems(d.items||[]);
  };

  return (
    <FlatList
      style={{flex:1,padding:12}}
      data={items}
      keyExtractor={(it)=>String(it.id)}
      ListEmptyComponent={<Text style={{ color:'#64748b', padding:12 }}>No hay turnos aceptados.</Text>}
      renderItem={({item})=>(
        <View style={{padding:12,borderWidth:1,borderRadius:10, marginBottom:10}}>
          <Text>{fmtDate(item.date)} • {fmtTime(item.time)} • {item.reason}</Text>
          <Text>Mascota: {item.pet_name} — Dueño: {item.owner_name}</Text>
          <View style={{flexDirection:'row', gap:8, marginTop:8}}>
            <TouchableOpacity
              onPress={async()=>{ await authFetch(`/appointments/${item.id}/complete`, {method:'PATCH', body:JSON.stringify({result:'COMPLETADO'})}); refreshVet(); }}
              style={{backgroundColor:'#2e7d32', padding:10, borderRadius:8}}
            >
              <Text style={{color:'#fff'}}>Completado</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async()=>{ await authFetch(`/appointments/${item.id}/complete`, {method:'PATCH', body:JSON.stringify({result:'INASISTENCIA'})}); refreshVet(); }}
              style={{backgroundColor:'#f57c00', padding:10, borderRadius:8}}
            >
              <Text style={{color:'#fff'}}>Inasistencia</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}
