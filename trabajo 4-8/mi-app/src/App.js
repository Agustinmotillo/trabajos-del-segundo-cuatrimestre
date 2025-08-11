import React from 'react';
import './App.css';
import HolaMundo from './components/HolaMundo';
import Tarjeta from './components/Tarjeta';
import Contador from './components/Contador';
import ListaTareas from './components/ListaTareas';
import Formulario from './components/Formulario';

function App() {
  return (
    <div className="App">
      <h1>Trabajo Práctico de Componentes</h1>
      <HolaMundo />
      <Tarjeta
        nombre="Agustín"
        apellido="Motillo"
        profesion="Contador Publico"
        imagen="https://media.licdn.com/dms/image/v2/D4E03AQElsvu1S78nmQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1711577985826?e=2147483647&v=beta&t=HCuocVsAr5AH5-gcicQrJGkK1gQx6XPJDOudrEELp80"
      />
      <Contador />
      <ListaTareas />
      <Formulario />
    </div>
  );
}

export default App;

