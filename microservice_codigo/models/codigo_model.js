import { db_pool } from "../codigo_config.js"

const modelCodigo = {
    getCodigo: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.cupon`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getCodigoTipo: async () => {
        try {
            const resultado = await db_pool.any(`
SELECT 
  t.id AS tipo_id,
  t.nombre AS tipo_nombre,
  t.color AS tipo_color,
  c.id AS cupon_id,
  c.titulo,
  c.nombre AS cupon_nombre,
  c.imagen,
  c.fecha_inicio,
  c.fecha_fin,
  c.regla_descuento,
  c.tiempo,
  c.estado,
  c.codigo,
  c.categoria_id,
  c.descuento,
  c.producto_id FROM 
  public.tipo t
INNER JOIN 
  public.cupon c ON c.tipo_id = t.id
ORDER BY 
  t.id, c.id;
`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getCuponCliente: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.cupon WHERE id = $1`,[id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
}

export default modelCodigo