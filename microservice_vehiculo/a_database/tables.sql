create table public.vehiculo(
	id serial primary key,
    placa varchar(100),
	modelo varchar(200),  
	marca varchar(200),
    color varchar(100),
    foto_vehiculo varchar(300),
	conductor_id int
);
