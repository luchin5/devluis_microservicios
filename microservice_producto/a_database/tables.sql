CREATE TABLE public.producto(
	id serial primary key,
	nombre varchar(100),
	descripcion varchar(200),
    foto varchar(1000),
    valoracion float,
    categoria varchar(100)
);

CREATE TABLE public.producto_promocion(
    id serial primary key,
    promocion_id int,
    producto_id int,
    cantidad int
);

CREATE TABLE public.promocion(
    id serial primary key,
    nombre varchar(100),
    descripcion varchar(200),
    foto varchar(1000),
    valoracion float,
    categoria varchar(100)
);

-- RELACIONES

ALTER TABLE public.producto_promocion ADD CONSTRAINT fk_producto_promocion FOREIGN KEY(producto_id) REFERENCES public.producto(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.producto_promocion ADD CONSTRAINT fk_promocion_promocion FOREIGN KEY(promocion_id) REFERENCES public.promocion(id) ON DELETE CASCADE ON UPDATE CASCADE;


-- Para la tabla producto
ALTER TABLE public.producto
ALTER COLUMN foto TYPE text[] USING ARRAY[foto];

-- Para la tabla promocion
ALTER TABLE public.promocion
ALTER COLUMN foto TYPE text[] USING ARRAY[foto];

--AGREGAR CAMPO DE CATEGORIA_ID

ALTER TABLE public.producto
DROP COLUMN categoria;

ALTER TABLE public.producto
ADD COLUMN categoria_id INTEGER;

