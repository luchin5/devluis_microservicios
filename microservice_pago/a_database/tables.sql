CREATE TABLE public.pagos(
	id serial primary key,
	cliente_id int,
    monto float,
    moneda varchar(100),
    fecha_pago date,
    estado varchar(100),
    metodo_pago_id int,
    pedido_id int
);

CREATE TABLE public.metodo_pago(
	id serial primary key,
	nombre varchar(200),
    tipo varchar(200),
    activo boolean
);

CREATE TABLE public.detalle_metodo_pago(
	id serial primary key,
	cliente_id int,
    metodo_pago_id int,
    detalle varchar(1000) -- JSON
);

CREATE TABLE public.transaccion(
	id serial primary key,
	pago_id int,
    estado varchar(200),
    mensaje varchar(1000), -- "saldo insuficiente"
    proveedor varchar(100), -- "visa",
    referencia varchar(100), --- "codigo unico de proveedor para la transaccion"
    fecha date
);

CREATE TABLE public.comisiones(
    id serial primary key,
    metodo_pago_id int,
    porcentaje float -- PORCENTAJE DE COMISION APLICADO
);


ALTER TABLE public.pagos
    ADD CONSTRAINT fk_metodo_pago
    FOREIGN KEY (metodo_pago_id)
    REFERENCES public.metodo_pago(id);

ALTER TABLE public.detalle_metodo_pago
    ADD CONSTRAINT fk_detalle_metodo_pago
    FOREIGN KEY (metodo_pago_id)
    REFERENCES public.metodo_pago(id);

ALTER TABLE public.transaccion
    ADD CONSTRAINT fk_pago
    FOREIGN KEY (pago_id)
    REFERENCES public.pagos(id);

ALTER TABLE public.comisiones
    ADD CONSTRAINT fk_comision_metodo_pago
    FOREIGN KEY (metodo_pago_id)
    REFERENCES public.metodo_pago(id);



