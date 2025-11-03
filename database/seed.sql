-- Crear tablas (si no existen) alineadas a tus capturas
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('CLIENTE','RECEPCIONISTA','VETERINARIO') NOT NULL DEFAULT 'CLIENTE'
);

CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  species VARCHAR(50),
  breed VARCHAR(100),
  age INT NULL,
  owner_id INT,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT,
  owner_id INT,
  date DATE,
  time VARCHAR(10),
  reason VARCHAR(255),
  status ENUM('PENDIENTE','ACEPTADO','RECHAZADO','COMPLETADO','INASISTENCIA') DEFAULT 'PENDIENTE',
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT NULL,
  to_user_id INT NULL,
  to_role ENUM('RECEPCIONISTA') NULL,
  message TEXT,
  leido TINYINT DEFAULT 0,
  is_read TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT,
  vet_id INT,
  type ENUM('VACUNA','NOTA'),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Usuarios de ejemplo (contraseñas sin hash aquí; el backend no las usa)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Agustin Cliente', 'cliente@example.com', '$2a$10$k8ByXzV7K0ZkA5b9p3i0eu0lJc9m3dL3gP5w2qgW6l5r0m7Bzq5cW', 'CLIENTE'),
(2, 'Rocio Recepcion', 'recepcion@example.com', '$2a$10$2oO4j9n2rFZyIuR1bqv2NO7v6zV8X5JfQ9rQx2Gq9lYjZ0zXKpZlm', 'RECEPCIONISTA'),
(3, 'Victor Vet', 'vet@example.com', '$2a$10$7m3Z0bYlQZsUj8hW2n5jUew8xNQeY2XK0mZb7VQx8Q2fQm8GJm3ZK', 'VETERINARIO');

-- Las contraseñas hash corresponden a:
-- cliente@example.com / cliente123
-- recepcion@example.com / recep123
-- vet@example.com / vet123
