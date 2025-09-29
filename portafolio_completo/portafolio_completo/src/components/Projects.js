import React, { useState, useEffect } from "react";
import "../styles.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("projects");
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch {
        setProjects([]);
      }
    } else {
      setProjects([{ name: "Mi Portfolio", url: "https://example.com" }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = () => {
    const name = newName.trim();
    const url = newUrl.trim();
    if (!name || !url) return;

    try {
      // eslint-disable-next-line no-new
      new URL(url);
    } catch {
      alert("Formato de URL no válido. Por favor incluye http:// o https://");
      return;
    }

    setProjects((p) => [...p, { name, url }]);
    setNewName("");
    setNewUrl("");
  };

  const removeProject = (index) => {
    setProjects((p) => p.filter((_, i) => i !== index));
  };

  const onKeyDownAdd = (e) => {
    if (e.key === "Enter") addProject();
  };

  return (
    <section id="projects" className="section">
      <div className="section-header">
        <h2>Proyectos</h2>
        <button className="edit-btn" onClick={() => setShowModal(true)}>
          Editar
        </button>
      </div>

      <ul className="projects-list">
        {projects.map((proj, i) => (
          <li key={i} className="project-item">
            <a href={proj.url} target="_blank" rel="noopener noreferrer">
              {proj.name}
            </a>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="modal-overlay" onMouseDown={() => setShowModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Editar Proyectos</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                placeholder="Nombre del proyecto"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="modal-input"
              />
              <input
                type="url"
                placeholder="https://ejemplo.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={onKeyDownAdd}
                className="modal-input"
              />

              <div style={{ display: "flex", gap: "8px", marginTop: 8 }}>
                <button className="primary-btn" onClick={addProject}>
                  Agregar
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setNewName("");
                    setNewUrl("");
                  }}
                >
                  Limpiar
                </button>
              </div>

              <ul className="modal-list">
                {projects.map((p, i) => (
                  <li key={i} className="modal-list-item">
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.name}
                    </a>
                    <span className="url-small">({p.url})</span>
                    <button
                      className="small-delete"
                      onClick={() => removeProject(i)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
