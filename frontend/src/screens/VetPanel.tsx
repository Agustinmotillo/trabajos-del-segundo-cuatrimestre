import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function VetPanel(){
  const { authFetch } = useAuth();
  const [petId,setPetId]=useState('');
  const [type,setType]=useState('VACUNA');
  const [desc,setDesc]=useState('');

  return (
    <View style={{flex:1, padding:12, gap:8}}>
      <Text style={{fontWeight:'700', fontSize:18}}>Agregar historia clínica</Text>
      <TextInput placeholder="ID Mascota" value={petId} onChangeText={setPetId} style={{borderWidth:1,padding:10,borderRadius:8}}/>
      <TextInput placeholder="Tipo (VACUNA o NOTA)" value={type} onChangeText={setType} style={{borderWidth:1,padding:10,borderRadius:8}}/>
      <TextInput placeholder="Descripción" value={desc} onChangeText={setDesc} style={{borderWidth:1,padding:10,borderRadius:8}}/>
      <TouchableOpacity onPress={async()=>{
        await authFetch('/medical-records', {method:'POST', body:JSON.stringify({pet_id:Number(petId), type, description:desc})});
        setPetId(''); setType('VACUNA'); setDesc('');
      }} style={{backgroundColor:'#2e7d32', padding:12, borderRadius:10}}>
        <Text style={{color:'#fff', textAlign:'center'}}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );
}
