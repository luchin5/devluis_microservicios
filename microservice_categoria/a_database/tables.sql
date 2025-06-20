CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE subcategoria (
    id SERIAL PRIMARY KEY,
    categoria_id INT,
    nombre VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

ALTER TABLE subcategoria
ADD COLUMN icono VARCHAR(300);


CREATE TABLE subcategoria_producto (
    id SERIAL PRIMARY KEY,
    subcategoria_id INT,
    producto_id INT,
    FOREIGN KEY (subcategoria_id) REFERENCES subcategoria(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


CREATE TABLE subcategoria_promocion (
    id SERIAL PRIMARY KEY,
    subcategoria_id INT,
    promocion_id INT,
    FOREIGN KEY (subcategoria_id) REFERENCES subcategoria(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


