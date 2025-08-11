import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks_v1");
    if (saved) return JSON.parse(saved);
    // muestra una tarea de ejemplo si no hay nada guardado
    return [
      {
        id: Date.now(),
        titulo: "Ejemplo: Estudiar React",
        descripcion: "Repasar hooks y enrutamiento",
        fecha: new Date().toLocaleDateString("es-AR"),
        completa: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("tasks_v1", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    const nueva = {
      ...task,
      id: Date.now(),
      fecha: new Date().toLocaleDateString("es-AR"),
      completa: !!task.completa
    };
    setTasks((prev) => [nueva, ...prev]);
  };

  const updateTask = (updated) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
    );
  };

  const deleteTask = (id) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completa: !t.completa } : t))
    );
  };

  return (
    <Router>
      <div className="app-root">
        <div className="container mt-2">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  tasks={tasks}
                  deleteTask={deleteTask}
                  toggleComplete={toggleComplete}
                />
              }
            />
            <Route path="/task/:id" element={<TaskDetail tasks={tasks} deleteTask={deleteTask} toggleComplete={toggleComplete} />} />
            <Route
              path="/create"
              element={<CreateTask addTask={addTask} />}
            />
            <Route
              path="/edit/:id"
              element={<CreateTask updateTask={updateTask} tasks={tasks} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
