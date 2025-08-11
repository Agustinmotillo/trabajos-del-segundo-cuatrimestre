import React from "react";
import { Link } from "react-router-dom";
import TaskCard from "../components/TaskCard";

export default function Home({ tasks, deleteTask, toggleComplete }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Lista de tareas</h2>
        <Link to="/create" className="btn btn-primary">
          + Nueva tarea
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p>No hay tareas aún.</p>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            deleteTask={deleteTask}
            toggleComplete={toggleComplete}
          />
        ))
      )}
    </div>
  );
}
