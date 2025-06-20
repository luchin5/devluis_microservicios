-- TABLA

CREATE TABLE public.pedido(
	id serial primary key,
	cliente_id int,
	subtotal float not null,
	descuento  float,
	total float not null,
	fecha timestamp not null,
	tipo varchar(20),
	foto varchar(200),
	estado varchar(50), -- pendiente, en proceso, entregado
	observacion varchar(1000),
	tipo_pago varchar(500),
	beneficiado_id int,
    almacen_id int,
	ubicacion_id int,
	cantidad_rechazado int,
	cantidad_noentregado int,
	hora_acumulada timestamp
);

CREATE TABLE public.detalle_pedido(
	id serial primary key,
	pedido_id int,
	producto_id int not null,
	cantidad int not null,
	promocion_id int
);

-- RELACIONES

ALTER TABLE public.detalle_pedido ADD CONSTRAINT fk_detalle_pedido FOREIGN KEY(pedido_id) REFERENCES public.pedido(id) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE tipo_delivery (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL UNIQUE
);

CREATE TABLE delivery (
    id SERIAL PRIMARY KEY,
    tipo_delivery_id INTEGER NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_tipo_delivery
        FOREIGN KEY (tipo_delivery_id)
        REFERENCES tipo_delivery(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


ALTER TABLE pedido
ADD COLUMN delivery_id INTEGER;

ALTER TABLE pedido
ADD CONSTRAINT fk_delivery
FOREIGN KEY (delivery_id)
REFERENCES delivery(id)
ON DELETE CASCADE
ON UPDATE CASCADE;


-- Crear tabla de códigos de descuento
CREATE TABLE codigo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR NOT NULL UNIQUE,
    descuento NUMERIC(10, 2) NOT NULL
);

-- Agregar campo codigo_id a pedido (opcional)
ALTER TABLE pedido
ADD COLUMN codigo_id INTEGER;

-- Relacionar con clave foránea, permitiendo NULL (cliente puede no usar código)
ALTER TABLE pedido
ADD CONSTRAINT fk_codigo
FOREIGN KEY (codigo_id)
REFERENCES codigo(id)
ON DELETE SET NULL  -- Si se borra el código, no se elimina el pedido
ON UPDATE CASCADE;