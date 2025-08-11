import React, { useState } from 'react';

function ListaTareas() {
  const [tarea, setTarea] = useState('');
  const [tareas, setTareas] = useState([]);

  const agregarTarea = () => {
    if (tarea.trim() !== '') {
      setTareas([...tareas, { texto: tarea, completada: false }]);
      setTarea('');
    }
  };

  const marcarCompletada = (index) => {
    const nuevasTareas = [...tareas];
    nuevasTareas[index].completada = !nuevasTareas[index].completada;
    setTareas(nuevasTareas);
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Lista de Tareas</h2>
      <input
        value={tarea}
        onChange={(e) => setTarea(e.target.value)}
        placeholder="Nueva tarea"
      />
      <button onClick={agregarTarea}>Agregar</button>
     <ul style={{ listStylePosition: 'inside', paddingLeft: '0' }}>
  {tareas.map((t, i) => (
    <li
      key={i}
      onClick={() => marcarCompletada(i)}
      style={{
        textDecoration: t.completada ? 'line-through' : 'none',
        cursor: 'pointer',
      }}
    >
      {t.texto}
    </li>
  ))}
</ul>

    </div>
  );
}

export default ListaTareas;
