import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function CreateTask({ addTask, updateTask, tasks }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const editing = Boolean(id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (editing) {
      const taskToEdit = tasks.find((t) => t.id === Number(id));
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description);
        setCompleted(taskToEdit.completed);
      }
    }
  }, [editing, id, tasks]);

  const validateText = (text) => /^[^\d]*$/.test(text); // no números

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Todos los campos son obligatorios");
      return;
    }
    if (!validateText(title) || !validateText(description)) {
      alert("No se permiten números en título o descripción");
      return;
    }

    if (editing) {
      updateTask({ id: Number(id), title, description, completed, date: new Date().toISOString().split("T")[0] });
    } else {
      addTask({ title, description, completed });
    }
    navigate("/");
  };

  return (
    <div>
      <h2>{editing ? "Editar tarea" : "Crear nueva tarea"}</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          <label className="form-check-label">¿Completada?</label>
        </div>
        <button type="submit" className="btn btn-primary">
          {editing ? "Guardar cambios" : "Guardar tarea"}
        </button>
      </form>
    </div>
  );
}

export default CreateTask;
