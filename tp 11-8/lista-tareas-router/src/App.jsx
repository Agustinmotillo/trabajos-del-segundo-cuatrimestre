import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initialTasks } from "./data";
import Home from "./pages/Home";
import TaskDetail from "./pages/TaskDetail";
import CreateTask from "./pages/CreateTask";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

function App() {
  const [tasks, setTasks] = useState(initialTasks);

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now(), date: new Date().toISOString().split("T")[0] }]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const updateTask = (updatedTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  return (
    <Router>
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Home tasks={tasks} deleteTask={deleteTask} />} />
          <Route path="/task/:id" element={<TaskDetail tasks={tasks} />} />
          <Route path="/create" element={<CreateTask addTask={addTask} />} />
          <Route path="/edit/:id" element={<CreateTask addTask={addTask} updateTask={updateTask} tasks={tasks} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
