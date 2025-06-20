import { db_pool } from "../conductor_config.js";

const modelUserConductor = {
    getAllUsersConductor: async () => {
        try {
            const resultado = await db_pool.any(
                `SELECT * 
                 FROM public.conductor 
                 WHERE nivel = 'admin' 
                 ORDER BY id ASC;`
            );
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    

    getConductorUserId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.conductor WHERE id = $1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getConductorUser_Id: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.conductor WHERE usuario_id = $1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    createUserConductor: async (conductor) => {

        try {
            
            const resultado = await db_pool.one(`
                INSERT INTO public.conductor (
                    usuario_id, nombres, apellidos, dni, fecha_nacimiento, n_licencia, n_soat, foto_licencia,
                     foto_soat, foto_otros, valoración, latitud, longitud, estado_registro, estado_trabajo, nivel, evento_id
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
                ) RETURNING *
            `, [
                conductor.usuario_id, conductor.nombres,conductor.apellidos ,conductor.dni, conductor.fecha_nacimiento, 
                conductor.n_licencia, conductor.n_soat, conductor.foto_licencia,
                conductor.foto_soat, conductor.foto_otros, conductor.valoración, conductor.latitud, 
                conductor.longitud, conductor.estado_registro, conductor.estado_trabajo, conductor.nivel, conductor.evento_id 
            ]);

            return resultado;

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },

    updateUserConductor: async (id, conductor) => {

        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.conductor SET nombres=$1, apellidos=$2, n_licencia=$3, dni=$4, fecha_nacimiento=$5 WHERE id = $6 RETURNING *`,
                [conductor.nombres, conductor.apellidos, conductor.n_licencia, conductor.dni, conductor.fecha_nacimiento, id]);
            if (!resultado) {
                return null;
            }
            return resultado
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    updateEventosConductor: async (id, conductor) => {

        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.conductor SET evento_id = $1 WHERE id = $2 RETURNING *`,
                [conductor.evento_id, id]);
            if (!resultado) {
                return null;
            }
            return resultado
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },


    deleteUserConductor: async (id) => {
        try {
            const result = await db_pool.result('DELETE FROM public.conductor WHERE ID = $1', [id]);
            return result.rowCount === 1; // Devuelve true si se eliminó un registro, false si no se encontró el registro
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    getEventoConductor: async() => {
        try {
            const resultado = await db_pool.any(
                `select * from public.evento`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getEventoConductorPorId: async(id) => {
        try {
            const resultado = await db_pool.oneOrNone(
                `SELECT e.nombre FROM evento AS e WHERE e.id = $1;`,[id]);
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },


    getEventoConductorEspecifico: async(id) => {
        try {
            const resultado = await db_pool.oneOrNone(
                `SELECT
    c.id,
    c.usuario_id,
    c.nombres,
    c.apellidos,
    c.dni,
    c.fecha_nacimiento,
    c.n_licencia,
    c.n_soat,
    c.foto_licencia,
    c.foto_soat,
    c.latitud,
    c.longitud,
    c.estado_registro,
    c.estado_trabajo,
    c.departamento,
    c.provincia,
    c.evento_id,
    e.nombre
FROM
    conductor AS c
INNER JOIN
    evento AS e ON c.evento_id = e.id
WHERE
    c.id = $1;
`,[id]);
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
 
    getDistribuidorAlmacen: async(id) => {
        try{
            const resultado = await db_pool.manyOrNone(`SELECT nombres, apellidos FROM public.conductor WHERE evento_id = $1 AND nivel = 'admin'`,[id]);
            return resultado
        }catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },
}

export default modelUserConductor;
