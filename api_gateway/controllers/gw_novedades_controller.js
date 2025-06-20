import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const service_novedades = process.env.MICRO_NOVEDAD;
const service_producto = process.env.MICRO_PRODUCTO;
const service_categoria = process.env.MICRO_CATEGORIA;

export const getNovedadesGw = async (req, res) => {
  try {
    const response = await axios.get(`${service_novedades}/novedad`);
    const novedades = response.data;

    const novedadesEnriquecidas = await Promise.all(novedades.map(async (novedad) => {
      let mediaData = null;

      if (novedad.producto_id) {
        const productoResponse = await axios.get(`${service_producto}/producto/${novedad.producto_id}`);
        mediaData = {
          producto: {
            id: productoResponse.data.id,
            foto: productoResponse.data.foto,
          },
        };
      } else if (novedad.promocion_id) {
        const promocionResponse = await axios.get(`${service_producto}/promocion/${novedad.promocion_id}`);
        mediaData = {
          promocion: {
            id: promocionResponse.data.id,
            foto: promocionResponse.data.foto,
          },
        };
      }

      let categoriaData = null;
      if (novedad.categoria_id) {
        const categoriaResponse = await axios.get(`${service_categoria}/categoria/${novedad.categoria_id}`);
        categoriaData = {
          categoria: {
            id: categoriaResponse.data.id,
            nombre: categoriaResponse.data.nombre,
          }
        };
      }

      return {
        id: novedad.id,
        titulo: novedad.titulo,
        descripcion: novedad.descripcion,
        terminos_condiciones: novedad.terminos_condiciones,
        ...mediaData,
        ...categoriaData
      };
    }));

    res.status(200).json(novedadesEnriquecidas);
  } catch (error) {
    console.error("Error al obtener las Novedades GW:", error.message);
    res.status(500).json({ error: error.message });
  }
};
