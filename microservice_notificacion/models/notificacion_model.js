import { db_pool } from "../notificacion_config.js";
import { io } from '../index.js'
const modelNotificaciones = {
    getAllNotificacionesAlmacen: async (id,fecha) => {
        try {
            console.log(`PARAMETROS ${id} ${fecha}`)
            const resultado = await db_pool.any(
                `SELECT * 
                FROM public.notificaciones 
                WHERE almacen_id = $1 
                AND DATE(fecha_creacion) = $2;
                `,
            [id,fecha])
            console.log("resultado",resultado)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    createNotificaciones: async (notificacion) => {
        try {
           const resultado = await db_pool.one(`INSERT INTO public.notificaciones(mensaje,tipo,estado,fecha_creacion,fecha_envio,almacen_id)
            values($1,$2,$3,$4,$5,$6) RETURNING *`,[
                notificacion.mensaje,
                notificacion.tipo,
                notificacion.estado,
                notificacion.fecha_creacion,
                notificacion.fecha_envio,
                notificacion.almacen_id
            ])
            return resultado;
        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    }, 

    getAllNotificacionesCliente: async (fecha) => {
        try {
            const resultado = await db_pool.any(
                `SELECT * 
                FROM public.notify_cliente
                WHERE DATE(fecha) = $1 ORDER BY id DESC;
                `,
            [fecha])
            //console.log("resultado",resultado)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    createNotificacionesCliente: async (notificacion) => {
        try {
           const resultado = await db_pool.one(`INSERT INTO public.notify_cliente(foto,titulo,fecha,descripcion)
            values($1,$2,$3,$4) RETURNING *`,[
                notificacion.foto,
                notificacion.titulo,
                notificacion.fecha,
                notificacion.descripcion
            ])
            io.emit('notify_cliente', resultado); 
            return resultado;
        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },
}
export default modelNotificaciones;
