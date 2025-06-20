create table public.notificaciones(
	id serial primary key,
	mensaje varchar(200),
    tipo varchar(200),
    estado varchar(200),
    fecha_creacion date,
    fecha_envio date  
);

create table public.logs_notificaciones(
    id serial primary key,
    notificacion_id int,
    mensaje_error varchar(300),
    fecha date
);

ALTER TABLE public.logs_notificaciones ADD CONSTRAINT fk_notificacion_log FOREIGN KEY (notificacion_id) REFERENCES public.notificaciones(id) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE public.notify_cliente (
    id SERIAL PRIMARY KEY,
    foto VARCHAR(255),
    titulo VARCHAR(200),
    fecha DATE,
    descripcion TEXT
);
