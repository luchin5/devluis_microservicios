import axios from 'axios';
import dotenv from 'dotenv'
dotenv.config()


const service_cliente = process.env.MICRO_CLIENTE
const service_producto = process.env.MICRO_PRODUCTO
const service_codigo = process.env.MICRO_CUPON;
const service_categoria = process.env.MICRO_CATEGORIA


export const getCuponGW = async (req, res) => {
  try {
    // Paso 1: Obtener todos los cupones
    const responseCodigo = await axios.get(`${service_codigo}/codigo_tipo`);
    const cupones = responseCodigo.data;

    // Objeto para agrupar por categoría
    const categoriasMap = {};

    for (const cupon of cupones) {
      const categoriaId = cupon.categoria_id;

      // Si no existe la categoría aún, obtener datos y crearla
      if (!categoriasMap[categoriaId]) {
        const categoriaRes = await axios.get(`${service_categoria}/categoria/${categoriaId}`);
        const nombreCategoria = categoriaRes.data.nombre;

        categoriasMap[categoriaId] = {
          id_categoria: categoriaId,
          nombre_categoria: nombreCategoria,
          cupones: []
        };
      }

      // Obtener el producto correspondiente al cupón
      let productoData = [];
      if (cupon.producto_id) {
        const productoRes = await axios.get(`${service_producto}/producto/${cupon.producto_id}`);
        productoData = [productoRes.data]; // se envuelve en array ya que producto es array
      }

      // Agregar el cupón a la categoría
      categoriasMap[categoriaId].cupones.push({
        id_cupon: cupon.cupon_id,
        titulo: cupon.titulo,
        cupon_nombre: cupon.cupon_nombre,
        imagen: cupon.imagen,
        fecha_inicio: cupon.fecha_inicio,
        fecha_fin: cupon.fecha_fin,
        regla_descuento: cupon.regla_descuento,
        codigo: cupon.codigo,
        descuento: cupon.descuento,
        producto: productoData
      });
    }

    // Convertir a array el resultado final
    const resultado = Object.values(categoriasMap);

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener cupones enriquecidos:", error.message);
    res.status(500).json({ error: error.message });
  }
};
