import React from "react";
import { Link } from "react-router-dom";

export default function TaskCard({ task, deleteTask, toggleComplete }) {
  return (
    <div
      className="card mb-3 task-card"
      style={{
        border: `3px solid ${task.completa ? "#198754" : "#dc3545"}`
      }}
    >
      <div className="card-body d-flex flex-column flex-md-row align-items-start justify-content-between">
        <div className="me-3" style={{ flex: 1 }}>
          <h5 className="card-title mb-1">{task.titulo}</h5>
          <p className="card-text mb-1 text-muted" style={{ whiteSpace: "pre-wrap" }}>
            {task.descripcion}
          </p>
          <small className="text-muted">Creada: {task.fecha}</small>
        </div>

        <div className="ms-3 text-md-end mt-3 mt-md-0" style={{ minWidth: 150 }}>
          <div className="mb-2">
            <span className={`badge ${task.completa ? "bg-success" : "bg-danger"} py-2 px-3`}>
              {task.completa ? "✔ Completada" : "✘ Incompleta"}
            </span>
          </div>

          <div className="d-flex flex-wrap justify-content-end gap-2">
            <Link to={`/task/${task.id}`} className="btn btn-sm btn-info">
              Ver
            </Link>
            <Link to={`/edit/${task.id}`} className="btn btn-sm btn-warning">
              Editar
            </Link>
            <button
              onClick={() => toggleComplete(task.id)}
              className="btn btn-sm btn-outline-success"
            >
              {task.completa ? "Marcar incompleta" : "Marcar completa"}
            </button>
            <button onClick={() => deleteTask(task.id)} className="btn btn-sm btn-danger">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
