import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateTask({ addTask, updateTask, tasks = [] }) {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [completa, setCompleta] = useState(false);

  const [errors, setErrors] = useState({ titulo: "", descripcion: "" });

  useEffect(() => {
    if (editing) {
      const t = tasks.find((x) => x.id === Number(id));
      if (t) {
        setTitulo(t.titulo);
        setDescripcion(t.descripcion);
        setCompleta(!!t.completa);
      }
    }
  }, [editing, id, tasks]);

  const validateAll = () => {
    const newErr = { titulo: "", descripcion: "" };
    const hasNumber = /\d/;

    if (!titulo.trim()) newErr.titulo = "El título es obligatorio.";
    else if (hasNumber.test(titulo)) newErr.titulo = "El título NO puede contener números.";

    if (!descripcion.trim()) newErr.descripcion = "La descripción es obligatoria.";
    else if (hasNumber.test(descripcion)) newErr.descripcion = "La descripción NO puede contener números.";

    setErrors(newErr);
    return !newErr.titulo && !newErr.descripcion;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    if (editing) {
      updateTask({
        id: Number(id),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        completa,
        // mantener la fecha original si existe:
        fecha: (tasks.find((x) => x.id === Number(id)) || {}).fecha || new Date().toLocaleDateString("es-AR")
      });
    } else {
      addTask({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        completa
      });
    }
    navigate("/");
  };

  return (
    <div>
      <h2>{editing ? "Editar tarea" : "Crear nueva tarea"}</h2>

      <form onSubmit={handleSubmit} noValidate className="mt-3">
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input
            className={`form-control ${errors.titulo ? "is-invalid" : ""}`}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          {errors.titulo && <div className="invalid-feedback">{errors.titulo}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            className={`form-control ${errors.descripcion ? "is-invalid" : ""}`}
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
        </div>

        <div className="form-check mb-3">
          <input
            id="completa"
            type="checkbox"
            className="form-check-input"
            checked={completa}
            onChange={(e) => setCompleta(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="completa">
            ¿Tarea completada?
          </label>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            {editing ? "Guardar cambios" : "Crear tarea"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
