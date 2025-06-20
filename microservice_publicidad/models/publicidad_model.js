import { db_pool } from "../publicidad_config.js"

const modelPublicidad ={
    getPublicidad: async () =>{
        try{
            const resultado = await db_pool.any(`SELECT * FROM public.banner`)
            return resultado
        }
        catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },
    getPublicidadBanners: async () => {
        const hora_backend =  new Date();
        try {
            const resultado = await db_pool.any(
                `SELECT 
                  pe.id,
                  pe.fecha_inicio,
                  pe.fecha_expiracion,
                  pe.titulo,
                  pe.fondo,
                  pb.id as banner_id,
                  pb.foto,
                  pb.titulo as banner_titulo,
                  pb.descripcion,
                  pb.restriccion
                FROM public.evento AS pe
                INNER JOIN public.banner AS pb ON pe.id = pb.evento_id
                WHERE $1 >= fecha_inicio AND $1 < fecha_expiracion`
            , [hora_backend]);

            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    }
    
}
export default modelPublicidad