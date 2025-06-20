CREATE TABLE public.tipo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(50)
);

CREATE TABLE public.cupon (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200),
    nombre VARCHAR(100),
    imagen VARCHAR(225),
    fecha_inicio DATE,
    fecha_fin DATE,
    regla_descuento TEXT,
    tiempo VARCHAR(50),
    estado VARCHAR(50),
    codigo VARCHAR(100),
    categoria_id INTEGER,
    tipo_id INTEGER,
    cliente_id INTEGER
);


ALTER TABLE public.cupon
ADD CONSTRAINT fk_cupon_tipo
FOREIGN KEY (tipo_id)
REFERENCES public.tipo(id)
ON DELETE CASCADE
ON UPDATE CASCADE;