import { db_pool } from "../novedad_config.js"

const modelNovedad = {
    getNovedad: async () => {
        const hora_backend = new Date();
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.novedad 
                WHERE $1 >= fecha_inicio AND $1 < fecha_fin
                ORDER BY id DESC;`,[hora_backend]);
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    }
}

export default modelNovedad