import React, { useState, useEffect } from "react";
import "../styles.css";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("skills");
    if (saved) {
      try {
        setSkills(JSON.parse(saved));
      } catch {
        setSkills([]);
      }
    } else {
      setSkills(["HTML", "CSS", "JavaScript"]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("skills", JSON.stringify(skills));
  }, [skills]);

  const addSkill = () => {
    const val = newSkill.trim();
    if (!val) return;
    setSkills((s) => [...s, val]);
    setNewSkill("");
  };

  const removeSkill = (index) => {
    setSkills((s) => s.filter((_, i) => i !== index));
  };

  const onKeyDownAdd = (e) => {
    if (e.key === "Enter") addSkill();
  };

  return (
    <section id="skills" className="section">
      <div className="section-header">
        <h2>Habilidades</h2>
        <button className="edit-btn" onClick={() => setShowModal(true)}>
          Editar
        </button>
      </div>

      <ul className="skills-list">
        {skills.map((skill, i) => (
          <li key={i} className="skill-item">
            {skill}
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="modal-overlay" onMouseDown={() => setShowModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Editar Habilidades</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                placeholder="Nueva habilidad (Enter para agregar)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={onKeyDownAdd}
                className="modal-input"
              />
              <div style={{ display: "flex", gap: "8px", marginTop: 8 }}>
                <button className="primary-btn" onClick={addSkill}>
                  Agregar
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => setNewSkill("")}
                >
                  Limpiar
                </button>
              </div>

              <ul className="modal-list">
                {skills.map((skill, i) => (
                  <li key={i} className="modal-list-item">
                    <span>{skill}</span>
                    <button
                      className="small-delete"
                      onClick={() => removeSkill(i)}
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
