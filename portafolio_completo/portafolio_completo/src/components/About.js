import React from "react";
import "./About.css"; // para estilos personalizados

function About() {
  return (
    <section id="about" className="section about">
      <h2>Sobre mí</h2>
      <div className="about-content">
        <img 
          src="/assets/mi-foto.jpg" 
          alt="Mi foto de perfil" 
          className="about-img"
        />
        <p>
          Soy un desarrollador apasionado por la tecnología, con experiencia en
          frontend, backend y creación de proyectos innovadores.
        </p>
      </div>
    </section>
  );
}

export default About;
