import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function TaskDetail({ tasks, deleteTask, toggleComplete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = tasks.find((t) => t.id === Number(id));

  if (!task) {
    return (
      <div>
        <h3>Tarea no encontrada</h3>
        <Link to="/" className="btn btn-primary mt-2">Volver</Link>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{ border: `3px solid ${task.completa ? "#198754" : "#dc3545"}` }}
    >
      <div className="card-body">
        <h3 className="card-title">{task.titulo}</h3>
        <p className="card-text">{task.descripcion}</p>
        <p><strong>Fecha de creación:</strong> {task.fecha}</p>
        <p>
          <strong>Estado:</strong>{" "}
          <span className={`badge ${task.completa ? "bg-success" : "bg-danger"}`}>
            {task.completa ? "✔ Completada" : "✘ Incompleta"}
          </span>
        </p>

        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-outline-success" onClick={() => { toggleComplete(task.id); navigate(-1); }}>
            {task.completa ? "Marcar incompleta" : "Marcar completa"}
          </button>
          <Link to={`/edit/${task.id}`} className="btn btn-warning">Editar</Link>
          <button className="btn btn-danger" onClick={() => { deleteTask(task.id); navigate("/"); }}>
            Eliminar
          </button>
          <Link to="/" className="btn btn-secondary">Volver</Link>
        </div>
      </div>
    </div>
  );
}
