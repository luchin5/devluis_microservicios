import { db_aguaSol, db_cliente, db_pool } from '../config.js'
import amqp from 'amqplib';
import { io } from '../index.js'
const RABBITMQ_URL = 'amqp://rabbitmq';// 'amqp://localhost';
const QUEUE_NAME = 'new_orders';

// Función para conectar y obtener un canal de RabbitMQ
async function getRabbitMQChannel() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    return channel;
}

const modelPedidoDetalle = {
    getPedidosAlmacen: async (almaid, estado) => {
        try {
            const pedidosAlmacen = db_pool.any(`
                SELECT * FROM public.pedido WHERE almacen_id = $1 AND estado = $2`, [almaid, estado])
            return pedidosAlmacen
        } catch (error) {
            throw new Error(`Error query get ${error}`)
        }
    },
    getPedido: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.pedido`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getPedidoId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.pedido WHERE id=$1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //ENDPOINT QUE RELACIONA EL ID DEL PEDIDO CON EL ID DEL CONDUCTOR
    getPedidoConductorId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT conductor_id FROM public.pedido WHERE id=$1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    postPedido: async (pedido) => {
        try {
            const resultado = await db_pool.one(`
                INSERT INTO public.pedido (cliente_id,descuento,fecha,estado,observacion,tipo_pago,ubicacion_id,delivery_id,cupon_id)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                [pedido.cliente_id, pedido.descuento, pedido.fecha, pedido.estado, pedido.observacion, pedido.tipo_pago, pedido.ubicacion_id, pedido.delivery_id,pedido.cupon_id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },
    updatePedido: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET tipo=$1, estado=$2
                WHERE id=$3 RETURNING *`, [pedido.tipo, pedido.estado, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },
    deletePedido: async (id) => {
        try {
            const resultado = await db_pool.result(`DELETE FROM public.pedido WHERE id=$1`, [id])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    //BASE DE DATOS DE DETALLE PEDIDO
    getPedidoDetalle: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.detalle_pedido`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getPedidoDetalleId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.detalle_pedido WHERE id=$1`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    postPedidoDetalle: async (pedido) => {
        try {
            const resultado = await db_pool.one(`
                INSERT INTO public.detalle_pedido (pedido_id,producto_id,cantidad,promocion_id)
                 VALUES ($1,$2,$3,$4) RETURNING *`,
                [pedido.pedido_id, pedido.producto_id, pedido.cantidad, pedido.promocion_id])
            return resultado
        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },
    updatePedidoDetalle: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.detalle_pedido SET cantidad=$1
                WHERE id=$2 RETURNING *`, [pedido.cantidad, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },
    deletePedidoDetalle: async (idPedido) => {
        try {
            const resultado = await db_pool.result(`DELETE FROM public.detalle_pedido WHERE id=$1`, [idPedido])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    //ENDPOINT QUE TRAE EL PEDIDO
    getDetallePedidoAll: async (id) => {
        try {
            const resultado = await db_pool.any(`
               SELECT
    ped.id,            
    ped.total, 
    ped.fecha,
    ped.observacion,
    ped.cliente_id, 
    ped.ubicacion_id, 
    ped.conductor_id, 
    ped.almacen_id, 
    det.producto_id, 
    det.cantidad, 
    det.promocion_id
FROM 
    public.pedido AS ped
INNER JOIN 
    public.detalle_pedido AS det ON ped.id = det.pedido_id
WHERE 
    ped.id = $1
ORDER BY det.producto_id ASC ;`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //ESTE ENDPOINT CUENTA CON LO SIGUIENTE EL NUMERO TOTAL DE PEDIDOS
    getPedidosCount: async (id) => {

        try {
            const resultado = await db_pool.oneOrNone(`
               SELECT COUNT(*) AS total_pedidos
FROM public.pedido
WHERE conductor_id = $1 AND estado = 'entregado';`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    //ENDPOINT DEL ULTIMO PEDIDO
    getPedidosConductorInfo: async (id) => {

        try {
            const resultado = await db_pool.oneOrNone(`
              SELECT 
                    pp.id, 
                    pp.cliente_id, 
                    pp.subtotal, 
                    pp.descuento, 
                    pp.total, 
                    pp.fecha, 
                    pp.tipo, 
                    pp.foto, 
                    pp.estado, 
                    pp.observacion, 
                    pp.tipo_pago, 
                    pp.beneficiado_id, 
                    pp.ubicacion_id, 
                    pp.conductor_id, 
                    pp.almacen_id,
                    pdp.id AS id_detalle, 
                    pdp.producto_id, 
                    pdp.cantidad, 
                    pdp.promocion_id
                FROM public.pedido AS pp
                INNER JOIN public.detalle_pedido AS pdp ON pp.id = pdp.pedido_id
                WHERE pp.conductor_id = $1
                AND pp.estado = 'entregado'
                ORDER BY pp.id DESC LIMIT 1;`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },


    getPedidosSinConductor: async () => {
        try {
            const resultado = await db_pool.any(`
               SELECT * 
FROM public.pedido
WHERE conductor_id IS NULL AND estado = 'pendiente'
ORDER BY id ASC;
`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    updatePedidoAlmacen: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET almacen_id=$1
                WHERE id=$2 RETURNING *`, [pedido.almacen_id, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    updatePedidoPrecio: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET subtotal=$1, total =$2, descuento=$3
                WHERE id=$4 RETURNING *`, [pedido.subtotal, pedido.total,pedido.descuento, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    updatePedidoConductor: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET conductor_id=$1
                WHERE id=$2 RETURNING *`, [pedido.conductor_id, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    getPedidoHistoryConductor: async (id, fecha) => {
        try {
            const resultado = await db_pool.manyOrNone(`
                SELECT 
                    pp.id, 
                    pp.cliente_id, 
                    pp.subtotal, 
                    pp.descuento, 
                    pp.total, 
                    pp.fecha, 
                    pp.tipo, 
                    pp.foto, 
                    pp.estado, 
                    pp.observacion, 
                    pp.tipo_pago, 
                    pp.beneficiado_id, 
                    pp.ubicacion_id, 
                    pp.conductor_id, 
                    pp.almacen_id,
                    pdp.id AS id_detalle, 
                    pdp.producto_id, 
                    pdp.cantidad, 
                    pdp.promocion_id
                FROM public.pedido AS pp
                INNER JOIN public.detalle_pedido AS pdp ON pp.id = pdp.pedido_id
                WHERE pp.conductor_id = $1
                AND pp.estado = 'en proceso'
                AND DATE(pp.fecha) = $2
                ORDER BY pp.id, pdp.id;
            `, [id, fecha]);

            // Agrupar los pedidos
            const pedidosAgrupados = resultado.reduce((acc, row) => {
                // Buscar si el pedido ya existe en el array acumulador
                let pedido = acc.find(p => p.id === row.id);

                if (!pedido) {
                    // Si no existe, creamos la estructura del pedido
                    pedido = {
                        id: row.id,
                        cliente: row.cliente_id,
                        total: row.total,
                        fecha: row.fecha,
                        tipo: row.tipo,
                        estado: row.estado,
                        ubicacion: row.ubicacion_id,
                        detalles_pedido: []
                    };
                    acc.push(pedido);
                }

                // Agregamos el detalle de pedido a la lista
                pedido.detalles_pedido.push({
                    id: row.id_detalle,
                    producto_id: row.producto_id,
                    cantidad: row.cantidad,
                    promocion_id: row.promocion_id
                });

                return acc;
            }, []);


            return pedidosAgrupados;

        } catch (error) {
            throw new Error(`Error get data ${error}`);
        }
    },


    getPedidoCentralPendiente: async () => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT COUNT(*) AS total_pedidos_pendientes
FROM public.pedido
WHERE estado = 'pendiente'
AND DATE(fecha) = CURRENT_DATE;
            `);
            return resultado;

        } catch (error) {
            throw new Error(`Error get data ${error}`);
        }
    },

    getPedidoCentralEnProceso: async () => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT COUNT(*) AS total_pedidos_enproceso
FROM public.pedido
WHERE estado = 'en proceso'
AND DATE(fecha) = CURRENT_DATE;
            `);
            return resultado;

        } catch (error) {
            throw new Error(`Error get data ${error}`);
        }
    },


    getPedidoCentralEntregado: async () => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT COUNT(*) AS total_pedidos_entregados
FROM public.pedido
WHERE estado = 'entregado'
AND DATE(fecha) = CURRENT_DATE;
            `);
            return resultado;

        } catch (error) {
            throw new Error(`Error get data ${error}`);
        }
    },

    getPedidoTotalCentral: async () => {
        try {
            const resultado = await db_pool.manyOrNone(
                `WITH datos_pedidos AS (
                    SELECT
                        CASE
                            WHEN EXTRACT(DOW FROM fecha) = 0 THEN 'Domingo'
                            WHEN EXTRACT(DOW FROM fecha) = 1 THEN 'Lunes'
                            WHEN EXTRACT(DOW FROM fecha) = 2 THEN 'Martes'
                            WHEN EXTRACT(DOW FROM fecha) = 3 THEN 'Miércoles'
                            WHEN EXTRACT(DOW FROM fecha) = 4 THEN 'Jueves'
                            WHEN EXTRACT(DOW FROM fecha) = 5 THEN 'Viernes'
                            WHEN EXTRACT(DOW FROM fecha) = 6 THEN 'Sábado'
                        END AS dia_semana,
                        SUM(total) AS suma_total,
                        EXTRACT(DOW FROM CURRENT_DATE) AS dia_actual,
                        EXTRACT(WEEK FROM CURRENT_DATE) AS numero_semana
                    FROM public.pedido
                    WHERE DATE(fecha) BETWEEN CURRENT_DATE - INTERVAL '6 days' AND CURRENT_DATE
                    GROUP BY EXTRACT(DOW FROM fecha)
                    ORDER BY MIN(fecha)
                ),
                mes_info AS (
                    SELECT 
                        (ARRAY['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'])[EXTRACT(MONTH FROM CURRENT_DATE)::int] AS mes_actual,
                        CEIL(EXTRACT(DAY FROM CURRENT_DATE) / 7.0)::int AS semana_del_mes
                )
                SELECT 
                    datos_pedidos.*,
                    mes_info.mes_actual,
                    mes_info.semana_del_mes
                FROM datos_pedidos, mes_info;`
            );
            return resultado;
        } catch (error) {
            throw new Error(`Error obteniendo datos: ${error}`);
        }
    },

    //ENDPOINT PARA TRAER LOS PEDIDOS 
    getPedidoDistribuidor: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
               SELECT COUNT(*) AS total_pedidos_pendientes 
             FROM public.pedido 
             WHERE almacen_id = $1 AND estado = 'pendiente'`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },


    updatePedidoConductorEstado: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(
                `UPDATE public.pedido 
                 SET conductor_id=$1, estado=$2, almacen_id=$3
                 WHERE id=$4 RETURNING *`,
                [pedido.conductor_id, pedido.estado, pedido.almacen_id, idPedido]
            );

            if (!resultado) return null;
            
                    // Buscar el pedido en la base de datos del microservicio de pedidos
                    const busqueda = await db_pool.oneOrNone(
                        `SELECT * FROM public.pedido WHERE id =$1`, 
                        [idPedido]
                    );
            
                    if (!busqueda) return null;
            
                    // Obtener la información del cliente desde el microservicio de clientes
                    const clienteMicro = await db_cliente.oneOrNone(
                        `SELECT * FROM public.cliente WHERE id = $1`, 
                        [busqueda.cliente_id]
                    );
            
                    if (!clienteMicro) return null;
            /*
                    // Buscar en la base de datos de Aguasol al cliente con sus datos
                    const busquedaAguaSolCliente = await db_aguaSol.oneOrNone(
                        `SELECT * FROM ventas.cliente 
                         WHERE nombre = $1 AND apellidos = $2 AND codigo = $3`,
                        [clienteMicro.nombre, clienteMicro.apellidos, clienteMicro.codigo]
                    );
            
                    if (!busquedaAguaSolCliente) return null;
            
                    // Buscar el pedido en la base de datos de Aguasol
                    const busquedaAguaSolPedido = await db_aguaSol.oneOrNone(
                        `SELECT * FROM ventas.pedido 
                         WHERE cliente_id = $1 AND estado IN ('pendiente', 'en proceso') 
                         ORDER BY id DESC LIMIT 1`,
                        [busquedaAguaSolCliente.id]
                    );            
            
                    if (!busquedaAguaSolPedido) return null;
            
                    // Actualizar el pedido en la base de datos de Aguasol
                    const result = await db_aguaSol.oneOrNone(
                        `UPDATE ventas.pedido 
                         SET estado = $1, foto=$2, observacion=$3, tipo_pago=$4 
                         WHERE id = $5 RETURNING *`,
                        [
                            pedido.estado,
                            null, // Si se necesita una foto, este valor debe ser dinámico
                            'conforme',
                            'efectivo',
                            busquedaAguaSolPedido.id
                        ]
                    );
            */
            return resultado;
        } catch (error) {
            throw new Error(`Error al actualizar el pedido: ${error.message}`);
        }
    },


    // modelPedidoDetalle.js (agregar logs clave)
    updatePedidoCancelado: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(
                `UPDATE public.pedido SET estado = 'anulado', observacion = $1
            WHERE id = $2 RETURNING *`,
                [pedido.observacion, idPedido]
            );

            if (!resultado) return null;

            // 👇 Agregar logs críticos aquí
            console.log('[MODEL] Emitiendo pedido_anulado:', resultado.id);
            console.log('[MODEL] Instancia de io disponible?', !!io); // Debe ser true

            io.emit('pedido_anulado', resultado); // <-- Emite el evento

            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    // En tu model, elimina la parte de la emisión del socket
    updatePedidoRotacionManual: async (idPedido, pedido) => {
        try {
            // 1. Obtener almacenActual
            const resultado_consulta = await db_pool.oneOrNone(
                `SELECT almacen_id FROM public.pedido WHERE id = $1`, [idPedido]
            );
            const almacenActual = resultado_consulta.almacen_id;

            // 2. Actualizar la base de datos
            const resultado = await db_pool.oneOrNone(
                `UPDATE public.pedido SET almacen_id = $1 WHERE id = $2 RETURNING *`,
                [pedido.almacen_id, idPedido]
            );
            if (!resultado) return null;

            // Ya no emitimos el evento aquí
            console.log('[MODEL] Rotación manual completada para pedido:', resultado.id);

            // Devolvemos también el almacén original para que el frontend tenga esta info
            return {
                ...resultado,
                almacenAnterior: almacenActual
            };
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    //GET DE PEDIDOS EN PENDIENTES
    getPedidosPendienteDistribuidor: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.pedido WHERE estado = 'pendiente'
ORDER BY id DESC`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //GET DE PEDIDOS EN PROCESO
    getPedidosEnProcesoDistribuidor: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.pedido WHERE estado = 'en proceso'
ORDER BY id DESC`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //GET DE PEDIDOS ENTREGADOS DE LA SEMANA
    getPedidosEntregadoDistribuidor: async () => {
        try {
            const resultado = await db_pool.any(`
               SELECT * FROM public.pedido 
WHERE estado = 'entregado' 
AND fecha >= CURRENT_DATE - INTERVAL '6 days' 
AND fecha < CURRENT_DATE + INTERVAL '1 day'
ORDER BY id DESC;
            `);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //RESUMEN DE LOS PEDIDOS 
    getConteoTotalPedidoDistribuidor: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT estado, COUNT(*) AS total
FROM public.pedido
WHERE estado IN ('pendiente', 'en proceso', 'entregado')
  AND (
    estado <> 'entregado' 
    OR (
      estado = 'entregado' 
      AND fecha >= CURRENT_DATE - INTERVAL '6 days' 
      AND fecha < CURRENT_DATE + INTERVAL '1 day'
    )
  )
GROUP BY estado
ORDER BY 
  CASE 
    WHEN estado = 'pendiente' THEN 1
    WHEN estado = 'en proceso' THEN 2
    WHEN estado = 'entregado' THEN 3
  END;
`);
            return resultado;
        }
        catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getConteoTotalDistribuidorPedido: async (fecha) => {
        try {
            const resultado = await db_pool.any(`
                SELECT almacen_id, COUNT(*) AS total_pedidos
FROM public.pedido
WHERE DATE(fecha) = $1  
GROUP BY almacen_id
ORDER BY almacen_id;
                `, [fecha])
            return resultado
        }
        catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getPedidosDistribuidorResumen: async (fecha, id) => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.pedido WHERE DATE(fecha) = $1 
                AND almacen_id = $2 ORDER BY id DESC
                `, [fecha, id])
            return resultado

        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getVentasPorDiaMes: async (mesAnio) => {
        try {
            // Procesar el parámetro mesAnio (formato: 'MM-YYYY')
            const [anio, mes] = mesAnio.split('-');

            // Crear fechas de inicio y fin del mes
            const fechaInicio = `${anio}-${mes}-01`;
            const fechaFin = mes === '12' ? `${parseInt(anio) + 1}-01-01` : `${anio}-${parseInt(mes) + 1}-01`;

            const resultado = await db_pool.any(`
                SELECT DATE(fecha) AS fecha_dia, SUM(total) AS ventas_total
                FROM public.pedido
                WHERE fecha >= $1 AND fecha < $2
                GROUP BY fecha_dia
                ORDER BY fecha_dia;
            `, [fechaInicio, fechaFin]);

            return resultado;
        } catch (error) {
            throw new Error(`Error al obtener ventas por día: ${error}`);
        }
    },

    getVentasTotalesMes: async (mesAnio) => {
        try {
            const [anio, mes] = mesAnio.split('-');

            // Crear fechas de inicio y fin del mes
            const fechaInicio = `${anio}-${mes}-01`;
            const fechaFin = mes === '12' ? `${parseInt(anio) + 1}-01-01` : `${anio}-${parseInt(mes) + 1}-01`;

            const resultado = await db_pool.any(`
            SELECT SUM(total) AS ventas_total 
            FROM public.pedido
            WHERE fecha >= $1 AND fecha < $2;
        `, [fechaInicio, fechaFin]);

            return resultado[0];// Devolver el objeto en lugar del array
        } catch (error) {
            throw new Error(`Error al obtener ventas totales: ${error}`);
        }
    },

    getPrimeraFechaPedido : async() => {
        try {
            const resultado = await db_pool.one(`
                SELECT 
                    TO_CHAR(fecha, 'MM-YYYY') AS mes_anio,
                    TO_CHAR(fecha, 'YYYY-MM') AS anio_mes
                FROM 
                    public.pedido
                ORDER BY 
                    fecha ASC
                LIMIT 1;
            `);
            return resultado;
        } catch(error) {
            throw new Error(`Error al obtener la primera fecha: ${error}`);
        }
    },


    updatePedidoDistribuidor: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(
                `UPDATE public.pedido SET estado = $1, observacion = $2
            WHERE id = $3 RETURNING *`,
                [pedido.estado, pedido.observacion, idPedido]
            );

            if (!resultado) return null;

            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    getPedidoClienteHistorialId: async (id) => {
    try {
        const hora_backend =  new Date();
        const fechaInicio = new Date(hora_backend);
        fechaInicio.setDate(hora_backend.getDate() - 1);
        const resultado = await db_pool.any(`
            SELECT 
                p.id AS pedido_id,
                p.cliente_id,
                p.fecha,
                p.estado,
                p.ubicacion_id,
                p.total,
                dp.id AS detalle_id,
                dp.producto_id,
                dp.cantidad,
                dp.promocion_id
            FROM 
                public.pedido p
            INNER JOIN 
                public.detalle_pedido dp ON p.id = dp.pedido_id
            WHERE 
                p.cliente_id = $1 
                AND p.fecha >= $2 
                AND fecha <= $3
            ORDER BY 
                p.id DESC;
        `, [id,fechaInicio,hora_backend]);

        const pedidosMap = new Map();

        resultado.forEach(row => {
            const {
                pedido_id,
                cliente_id,
                fecha,
                estado,
                ubicacion_id,
                total,
                detalle_id,
                producto_id,
                cantidad,
                promocion_id
            } = row;

            if (!pedidosMap.has(pedido_id)) {
                pedidosMap.set(pedido_id, {
                    pedido_id,
                    cliente_id,
                    fecha,
                    estado,
                    ubicacion_id,
                    total,
                    detalles: []
                });
            }

            pedidosMap.get(pedido_id).detalles.push({
                id: detalle_id,
                producto_id,
                cantidad,
                promocion_id
            });
        });

        const pedidos = Array.from(pedidosMap.values());
        return pedidos;

    } catch (error) {
        throw new Error(`Error get data: ${error}`);
    }
},

getDeliveryTipo : async() => {
        try {
            const resultado = await db_pool.any(`
                SELECT 
    d.id AS id,
    d.precio AS precio,
    td.nombre AS nombre
FROM 
    delivery d
INNER JOIN 
    tipo_delivery td 
ON 
    d.tipo_delivery_id = td.id
ORDER BY d.id ASC;
            `);
            return resultado;
        } catch(error) {
            throw new Error(`Error al obtener la primera fecha: ${error}`);
        }
    },

getDeliveryTipoById: async (id) => {
    try {
        const resultado = await db_pool.oneOrNone(`
            SELECT 
                d.id AS id,
                d.precio AS precio,
                td.nombre AS nombre
            FROM 
                delivery d
            INNER JOIN 
                tipo_delivery td 
            ON 
                d.tipo_delivery_id = td.id
            WHERE 
                d.id = $1
            ORDER BY 
                d.id ASC;
        `, [id]);
        return resultado;
    } catch (error) {
        throw new Error(`Error al obtener el delivery con ID ${id}: ${error}`);
    }
},

getCodigoVerificacion: async (codigo) => {
    const hora_backend =  new Date();
    try {
        const resultado = await db_pool.oneOrNone(`
            SELECT * FROM public.codigo_descuento WHERE codigo = $1 
            AND $2 >= fecha_inicio AND $2 < fecha_fin
        `, [codigo,hora_backend]);
        return resultado;
    } catch (error) {
        throw new Error(`Error al verificar el código: ${error}`);
    }
},

getCodigoDescuento: async (id) => {
    try {
        const resultado = await db_pool.oneOrNone(`
            SELECT * FROM public.codigo_descuento WHERE id = $1
        `, [id]);
        return resultado;
    } catch (error) {
        throw new Error(`Error al verificar el código: ${error}`);
    }
},




}

export default modelPedidoDetalle