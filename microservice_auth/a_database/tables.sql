
-- TABLA

CREATE TABLE public.usuario(
    id serial primary key,
    rol_id int,
    nickname varchar(50),
    contrasena varchar(50),
    email varchar(50),
    telefono varchar(20)
);

CREATE TABLE public.rol(
    id serial primary key,
    nombre varchar(50)
);

-- RELACIONES

ALTER TABLE public.usuario ADD CONSTRAINT fk_usuario_rol FOREIGN KEY(rol_id) REFERENCES public.rol(id) ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE public.usuario ADD COLUMN firebase_uid VARCHAR(255);
