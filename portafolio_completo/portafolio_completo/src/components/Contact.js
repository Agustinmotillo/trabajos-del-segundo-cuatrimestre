import React, { useState } from "react";
import "./contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = formData.name.trim();

    // Validar nombre: mínimo 2 caracteres y no solo números
    if (!nameTrimmed || nameTrimmed.length < 2 || /^[0-9]+$/.test(nameTrimmed)) {
      newErrors.name = "Por favor ingresa un nombre válido.";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = "Por favor ingresa un email válido.";
    }

    // Validar mensaje: mínimo 5 caracteres
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      newErrors.message = "Por favor ingresa un mensaje válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setSuccess(false);
    }
  };

  return (
    <section id="contact" className="section">
      <h2>Contacto</h2>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <textarea
          name="message"
          placeholder="Mensaje"
          rows="5"
          value={formData.message}
          onChange={handleChange}
        />
        {errors.message && <span className="error">{errors.message}</span>}

        <button type="submit">Enviar</button>
        <div className={`contact-success ${success ? "show" : ""}`}>
          ¡Mensaje enviado con éxito!
        </div>
      </form>
    </section>
  );
}

export default Contact;
