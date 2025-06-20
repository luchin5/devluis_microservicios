create table public.conductor(
	id serial primary key,
	usuario_id int unique,
	nombres varchar(100) not null,
	apellidos varchar(100) not null,
	dni varchar(100) not null,
	fecha_nacimiento date not null,
    n_licencia varchar (100) not null,
	n_soat varchar (100) not null,
    foto_licencia varchar(300),
    foto_soat  varchar(300),
    foto_otros varchar(300),
    valoración float,
    latitud float,
    longitud float,
    estado_registro varchar(50),
    estado_trabajo varchar(50),
    departamento varchar(50),
    provincia varchar(50),
    evento_id INT, 
    CONSTRAINT fk_evento FOREIGN KEY (evento_id) REFERENCES public.evento (id) 
);	

CREATE TABLE public.evento (
    id SERIAL PRIMARY KEY, 
    nombre VARCHAR(100) NOT NULL 
);


