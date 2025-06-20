import { db_pool } from '../config.js'

const modelZonaPromocion = {

    getZonaPromocion: async (idZona,idPromocion) => {
            try{
                const resultado = await db_pool.oneOrNone(
                    `SELECT * FROM public.zona_promocion WHERE zona_id = $1 AND promocion_id=$2`
                    ,[idZona, idPromocion]
                );
                return resultado;
            }catch(error){
                throw new Error(`Error get data: ${error}`);
            }
        },

    getPromoDetalles: async (idPromocion) => {
            try{
                const resultado = await db_pool.oneOrNone(
                    `SELECT zp.*, e.*
    FROM public.zona_promocion  zp
    INNER JOIN public.estilo e ON zp.estilo_id = e.id
    WHERE zp.promocion_id = $1;
    `
                    ,[idPromocion]
                );
                return resultado;
            }catch(error){
                throw new Error(`Error get data: ${error}`);
            }
    },

    getPromoDetallesZona: async (idZona,idPromocion) => {
            try{
                const resultado = await db_pool.oneOrNone(
                    `SELECT zp.*, e.*
    FROM public.zona_promocion  zp
    INNER JOIN public.estilo e ON zp.estilo_id = e.id
    WHERE zp.zona_id = $1 AND zp.promocion_id = $2; 
    `
                    ,[idZona, idPromocion]
                );
                //zona_id = $1 AND promocion_id=$2
                return resultado;
            }catch(error){
                throw new Error(`Error get data: ${error}`);
            }
    }

}

export default modelZonaPromocion