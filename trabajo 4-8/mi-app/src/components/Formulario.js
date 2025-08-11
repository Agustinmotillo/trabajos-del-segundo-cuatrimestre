import React, { useState } from 'react';

function Formulario() {
  const [nombre, setNombre] = useState('');
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div style={{ margin: '20px' }}>
      <form onSubmit={manejarEnvio}>
        <label>
          Ingresá tu nombre:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>
        <button type="submit">Enviar</button>
      </form>
      {enviado && <h2>¡Bienvenido/a, {nombre}!</h2>}
    </div>
  );
}

export default Formulario;
