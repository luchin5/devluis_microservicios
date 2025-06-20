create table public.almacen(
	id serial primary key,
	nombre varchar(200),
    latitud float,
    longitud float,
    horario varchar(200),
	departamento varchar(200),
	provincia varchar(200),
    direccion varchar(300) 
);  

SELECT setval('public.almacen_id_seq', 1, false);
