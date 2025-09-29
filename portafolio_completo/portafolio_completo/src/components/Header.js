import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <h1>Mi Portafolio</h1>
      <nav>
        <a href="#about">Sobre mí</a>
        <a href="#skills">Habilidades</a>
        <a href="#experience">Experiencia</a>
        <a href="#projects">Proyectos</a>
        <a href="#contact">Contacto</a>
      </nav>
    </header>
  );
}

export default Header;
