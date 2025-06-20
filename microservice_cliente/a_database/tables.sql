-- TABLA
CREATE TABLE public.cliente(
    id serial primary key,
    usuario_id int,
    nombres varchar(100),
    apellidos varchar(100),
    dni varchar(20),
    fecha_nacimiento date,
    sexo varchar(20),
    codigo varchar(20),
    saldo_beneficios float,
    suscripcion varchar(50),
    quiere_retirar BOOLEAN,
    medio_retiro varchar(50),
    numero_cuenta varchar(100),
    fecha_creacion date,
    ruc varchar(100),
    calificacion float,
    foto_cliente varchar(1000)
);


-- VALORACION CLIENTE
CREATE TABLE public.valoracion_cliente (
    id serial PRIMARY KEY,
    cliente_id int NOT NULL,
    producto_id int,
    promocion_id int,
    calificacion float
);

-- CLAVE FORANEA CON RESPECTO A LA VALORACIOND EL CLIENTE
ALTER TABLE public.valoracion_cliente
ADD CONSTRAINT fk_cliente_valoracion FOREIGN KEY (cliente_id)
REFERENCES public.cliente(id)
ON DELETE CASCADE ON UPDATE CASCADE;

--------------------------------------------------TABLA PARA DEV_MICRO_CLIENTE
CREATE TABLE public.cliente(
    id serial primary key,
    usuario_id int,
    nombres varchar(100),
    apellidos varchar(100),
    dni varchar(20),
    fecha_nacimiento date,
    sexo varchar(20),
    codigo_id int,  -- Cambio realizado aquí
    saldo_beneficios float,
    suscripcion varchar(50),
    quiere_retirar BOOLEAN,
    medio_retiro varchar(50),
    numero_cuenta varchar(100),
    fecha_creacion date,
    ruc varchar(100),
    calificacion float,
    foto_cliente varchar(1000)
);



-- VALORACION CLIENTE
CREATE TABLE public.valoracion_cliente (
    id serial PRIMARY KEY,
    cliente_id int NOT NULL,
    producto_id int,
    promocion_id int,
    calificacion float
);

-- CLAVE FORANEA CON RESPECTO A LA VALORACIOND EL CLIENTE
ALTER TABLE public.valoracion_cliente
ADD CONSTRAINT fk_cliente_valoracion FOREIGN KEY (cliente_id)
REFERENCES public.cliente(id)
ON DELETE CASCADE ON UPDATE CASCADE;


--soporte tecnico cliente

CREATE TABLE public.soporte_tecnico (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    asunto VARCHAR(255),
    descripcion TEXT
);


ALTER TABLE public.soporte_tecnico
ADD CONSTRAINT fk_cliente_soporte
FOREIGN KEY (cliente_id)
REFERENCES public.cliente(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


CREATE TABLE public.libro_reclamaciones (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(255) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    tipo_reclamo VARCHAR(100) NOT NULL,
    descripcion TEXT
);

---------------------BASE DE DATOS DE PRUEBA-------
-- Eliminar la columna 'codigo_id'
ALTER TABLE public.cliente
DROP COLUMN IF EXISTS codigo_id;

-- Agregar la nueva columna 'codigo' de tipo VARCHAR(20)
ALTER TABLE public.cliente
ADD COLUMN codigo VARCHAR(20);
