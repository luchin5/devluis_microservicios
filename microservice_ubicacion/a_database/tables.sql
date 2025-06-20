create table public.ubicacion(
	id serial primary key,
	departamento varchar(200),
    provincia varchar(200),
    distrito varchar(200),
    direccion varchar(300),
    latitud float,
	longitud float,
	cliente_id int,
	zona_trabajo_id int    
);

CREATE TABLE public.zona_trabajo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(500),
    poligono_coordenadas NUMERIC[][] 
);


ALTER TABLE public.ubicacion ADD CONSTRAINT fk_ubicacion_zona 
FOREIGN KEY (zona_trabajo_id) REFERENCES public.zona_trabajo(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

/*ACTUALIZAR POLIGONO DE AREQUIPA*/
UPDATE public.zona_trabajo
SET poligono_coordenadas = '{{-72.00433666166178,-16.146343643298945},{-71.92534452748886,-16.162998705184098},{-71.85983885524789,-16.124134713832447},{-71.6496594192571,-15.992138326036311},{-71.69716268391205,-15.931242576423351},{-71.33523304844574,-15.935592886439624},{-71.20629561581089,-16.01170802475406},{-70.97104135275778,-15.97256671147678},{-70.84662804056624,-15.920366388926444},{-70.85793834167455,-16.050841666284285},{-70.89639336544285,-16.276796086824316},{-70.98008959364444,-16.302851088553567},{-70.96877929253611,-16.46778543385711},{-71.23796445891418,-16.450430505782684},{-71.3234374390305,-16.72933353422941},{-71.5601625331648,-16.66749467143327},{-71.75653675898073,-16.68810984991633},{-71.86951919027209,-16.775699524236252},{-71.8668291323842,-16.71902844799142},{-71.92063029014199,-16.670071690253284},{-72.00402208466657,-16.796303002756673},{-72.23267700513719,-16.657186249172693},{-72.27571793134342,-16.61079148599305},{-72.00433666166178,-16.146343643298945}}'
WHERE id = 1;

ALTER TABLE public.ubicacion
ADD COLUMN etiqueta VARCHAR(300);


/*DEPARTAMENTOS*/

CREATE TABLE public.departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

INSERT INTO public.departamentos (nombre) VALUES
('Amazonas'),
('Áncash'),
('Apurímac'),
('Arequipa'),
('Ayacucho'),
('Cajamarca'),
('Callao'),
('Cusco'),
('Huancavelica'),
('Huánuco'),
('Ica'),
('Junín'),
('La Libertad'),
('Lambayeque'),
('Lima'),
('Loreto'),
('Madre de Dios'),
('Moquegua'),
('Pasco'),
('Piura'),
('Puno'),
('San Martín'),
('Tacna'),
('Tumbes'),
('Ucayali');


CREATE TABLE public.distritos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento_id INTEGER NOT NULL,    
    -- Clave foránea a departamentos
    CONSTRAINT fk_departamento
      FOREIGN KEY (departamento_id)
      REFERENCES public.departamentos (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);