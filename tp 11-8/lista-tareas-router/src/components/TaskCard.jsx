import { Link } from "react-router-dom";

function TaskCard({ task, deleteTask }) {
  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start">
        <div>
          <h5 className="card-title">{task.title}</h5>
          <p className="card-text">{task.description}</p>
        </div>
        <div className="mt-2 mt-md-0">
          <Link to={`/task/${task.id}`} className="btn btn-primary btn-sm me-2">
            Ver
          </Link>
          <Link to={`/edit/${task.id}`} className="btn btn-warning btn-sm me-2">
            Editar
          </Link>
          <button onClick={() => deleteTask(task.id)} className="btn btn-danger btn-sm">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
