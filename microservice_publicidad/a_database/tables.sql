create table public.banner(
	id serial primary key,
    foto varchar(300),
	fecha_expiracion date,  
	titulo varchar(200),
    descripcion varchar(300)
);

ALTER TABLE public.banner
DROP COLUMN fecha_expiracion;

ALTER TABLE public.banner
ADD COLUMN evento_id INT,
ADD COLUMN fondo VARCHAR(300);

CREATE TABLE public.evento (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE,
    fecha_expiracion DATE,
    titulo VARCHAR(200)
);


ALTER TABLE public.banner ADD CONSTRAINT fk_banner_evento
FOREIGN KEY (evento_id) REFERENCES public.evento(id)
ON DELETE CASCADE ON UPDATE CASCADE;