import { db_pool } from "../almacen_config.js";

// RESPETAR Y APLICAR LA SIGUIENTE ESTRUCTURA, PARA TODOS
// LOS MICROSERVICIOS : GET , GET(id), POST, PUT y DELETE

// RESPETAR LOS CATCHS ERROR GENERALIZADOS PARA TODOS LOS MICROSERVICIOS
// RESPETAR Y APLICAR LA SIGUIENTE ESTRUCTURA, PARA TODOS
// LOS MICROSERVICIOS : GET , GET(id), POST, PUT y DELETE

// RESPETAR LOS CATCHS ERROR GENERALIZADOS PARA TODOS LOS MICROSERVICIOS
const modelAlmacen = {
  
  getAllAlmacen: async () => {
    try {
      const resultado = await db_pool.any(`
        SELECT * FROM public.almacen`);
      return resultado;
    } catch (error) {
      throw new Error(`Error get data: ${error}`);
    }
  },

  
  getAlmacenId: async (id) => {
    try {
      const resultado = await db_pool.oneOrNone(
        `SELECT * FROM public.almacen WHERE id = $1`,
        [id]
      );
      return resultado;
    } catch (error) {
      throw new Error(`Error get data: ${error}`);
    }
  },

  createAlmacen: async (almacen) => {
    try {
      const resultado = await db_pool.one(
        `INSERT INTO public.almacen 
        (nombre, latitud, longitud, horario, departamento, provincia, direccion)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          almacen.nombre,
          almacen.latitud,
          almacen.longitud,
          almacen.horario,
          almacen.departamento,
          almacen.provincia,
          almacen.direccion,
        ]
      );
      return resultado;
    } catch (error) {
      throw new Error(`Error post data ${error}`);
    }
  },

  // USAR EN TODOS LOS MICROSERVICIOS - UPDATE: oneOrNone
  updateAlmacen: async (id, almacen) => {
    try {
      const resultado = await db_pool.oneOrNone(
        `UPDATE public.almacen SET nombre=$1, horario=$2, departamento=$3, provincia=$4, direccion=$5
         WHERE id = $6 RETURNING *`,
        [
          almacen.nombre,
          almacen.horario,
          almacen.departamento,
          almacen.provincia,
          almacen.direccion,
          id,
        ]
      );
      // Si no hay resultado o si es nulo
      if (!resultado) {
        return null;
      }
      return resultado;
    } catch (error) {
      throw new Error(`Error put data: ${error.message}`);
    }
  },

  deleteAlmacen: async (id) => {
    try {
      const result = await db_pool.result( "DELETE FROM public.almacen WHERE ID = $1",[id]);
      
      // Devuelve true si se eliminó un registro, false si no se encontró el registro
      return result.rowCount === 1; 
      
    } catch (error) {
      throw new Error(`Error delete data ${error.message}`);
    }
  },
};
  

export default modelAlmacen;
