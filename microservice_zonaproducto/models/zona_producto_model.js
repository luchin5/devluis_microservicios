import { db_pool } from '../config.js'

const modelZonaProducto = {
    getCantidadPromoProducto: async (idZona, idProducto) => {
            try{
                const resultado = await db_pool.oneOrNone(
                    `SELECT * FROM public.zona_producto WHERE zona_id = $1 AND producto_id=$2`
                    ,[idZona, idProducto]
                );
                return resultado;
            }catch(error){
                throw new Error(`Error get data: ${error}`);
            }
    },

    getPromoProductoDetalles: async (idProducto) => {
        try{
            const resultado = await db_pool.oneOrNone(
                `SELECT zp.*, e.*
FROM public.zona_producto zp
INNER JOIN public.estilo e ON zp.estilo_id = e.id
WHERE zp.producto_id = $1;
`
                ,[idProducto]
            );
            return resultado;
        }catch(error){
            throw new Error(`Error get data: ${error}`);
        }
},

getProductoZonaDetalle: async (idZona, idProducto) => {
            try{
                const resultado = await db_pool.oneOrNone(
                    `SELECT zp.*, e.*
FROM public.zona_producto zp
INNER JOIN public.estilo e ON zp.estilo_id = e.id
WHERE zp.zona_id = $1 AND zp.producto_id = $2;`
                    ,[idZona, idProducto]
                );
                //zona_id = $1 AND producto_id=$2
                return resultado;
            }catch(error){
                throw new Error(`Error get data: ${error}`);
            }
    },
    

}
export default modelZonaProducto