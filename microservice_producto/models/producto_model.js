import { db_pool } from '../producto_config.js'

const modelProducto = {
    getProducto: async () => {
        try {
            const resultado = await db_pool.any(`
                    SELECT * FROM public.producto`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getProductoId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                    SELECT * FROM public.producto WHERE id=$1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getPromocion: async () => {
        try {
            const resultado = await db_pool.any(`
                    SELECT * FROM public.promocion`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getPromocionId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                    SELECT * FROM public.promocion WHERE id=$1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getCantidadPromoProducto: async (idPromocion, idProducto) => {
        try{
            const resultado = await db_pool.oneOrNone(
                `SELECT cantidad FROM public.producto_promocion WHERE promocion_id = $1 AND producto_id=$2`
                ,[idPromocion, idProducto]
            );
            return resultado;
        }catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },

    
    //MODEL PARA PODER ACTUALIZAR LA CALIFICACION DE MIS PRODUCTOS
    actualizarCalificacionProducto: async (id, producto) =>{
            try{
                //ACTUALIZAMOS LA DIRECCIÓN QUE SELECCIONO EL CLIENTE
                const resultado = await db_pool.oneOrNone(`UPDATE public.producto SET valoracion=$1
                    WHERE id=$2 RETURNING *`, [producto.valoracion, id])
                return resultado;
            }catch(error){
                throw new Error(`Error put data: ${error}`);
            }
        },

     //MODEL PARA ACTUALIZAR LA CALIFICACION DE LAS PROMOCIONES   
     actualizarCalificacionPromocion: async (id, promocion) =>{
        try{
            //ACTUALIZAMOS LA DIRECCIÓN QUE SELECCIONO EL CLIENTE
            const resultado = await db_pool.oneOrNone(`UPDATE public.promocion SET valoracion=$1
                WHERE id=$2 RETURNING *`, [promocion.valoracion, id])
            return resultado;
        }catch(error){
            throw new Error(`Error put data: ${error}`);
        }
    },

    //MODEL QUE ME TRAE DE FORMA ALEATORIA PRODUCTOS Y PROMOCIONES
    getProductosYPromocionesModel: async () => {
        try {
            // Obtener 2 productos aleatorios
            const productos = await db_pool.any(`
                SELECT * FROM public.producto
                ORDER BY RANDOM()
                LIMIT 2
            `);
            
            // Obtener 2 promociones aleatorias
            const promociones = await db_pool.any(`
                SELECT * FROM public.promocion
                ORDER BY RANDOM()
                LIMIT 2
            `);
            
            // Retornar ambos conjuntos de datos
            return {
                productos: productos,
                promociones: promociones
            };
        } catch (error) {
            throw new Error(`Error al obtener productos y promociones aleatorios: ${error}`);
        }
    },

    getProductoIdByPromocion: async (id) => {
    try {
        const resultado = await db_pool.oneOrNone(`
            SELECT producto_id FROM public.producto_promocion WHERE promocion_id = $1
        `, [id]);
        return resultado;
    } catch (error) {
        throw new Error(`Error get data: ${error}`);
    }
},

}

export default modelProducto