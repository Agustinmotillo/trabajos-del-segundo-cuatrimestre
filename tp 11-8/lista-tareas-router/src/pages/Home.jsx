import { Link } from "react-router-dom";
import TaskCard from "../components/TaskCard";

function Home({ tasks, deleteTask }) {
  return (
    <div>
      <h1 className="mb-4">Lista de Tareas</h1>
      <Link to="/create" className="btn btn-success mb-3">
        ➕ Crear nueva tarea
      </Link>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} deleteTask={deleteTask} />
        ))
      ) : (
        <p>No hay tareas registradas.</p>
      )}
    </div>
  );
}

export default Home;
