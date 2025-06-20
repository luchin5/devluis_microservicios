CREATE TABLE public.zona_producto(
	id serial primary key,
	zona_id int,
    producto_id int,
    precio float
);

ALTER TABLE public.zona_producto
ADD COLUMN estilo_id int;

CREATE TABLE public.estilo (
    id serial PRIMARY KEY,
    color_fondo varchar(50),
    color_boton varchar(50),
    color_letra varchar(50)
);



ALTER TABLE public.zona_producto
ADD CONSTRAINT fk_estilo
FOREIGN KEY (estilo_id)
REFERENCES public.estilo(id)
ON DELETE CASCADE
ON UPDATE CASCADE;