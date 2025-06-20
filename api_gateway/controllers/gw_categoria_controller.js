import axios from 'axios';
import dotenv from 'dotenv'
import * as turf from "@turf/turf";

dotenv.config()

const service_categoria = process.env.MICRO_CATEGORIA
const service_producto = process.env.MICRO_PRODUCTO;
const service_zonaproducto = process.env.MICRO_ZONAPRODUCTO;
const service_zonapromocion = process.env.MICRO_ZONAPROMOCION;
const service_ubicacion = process.env.MICRO_UBICACION;
const service_cliente = process.env.MICRO_CLIENTE

//const service_almacen = process.env.MICRO_ALMACEN;



//ENDPOINT QUE TRAE TODAS LAS UBICACIONES REGISTRADAS POR EL CLIENTE EN SU APP
export const getCategoriasControllerGW = async (req, res) => {
  //TRAER LA ULTIMA UBICACION DEL CLIENTE 
  try {
    const response = await axios.get(`${service_categoria}/allcategorias`)
    if (response) {
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid get data" });
    }

  } catch (error) {
    res.status(500).json({ error: error.message })
  }

}
//FUNCION PARA TRAER LAS REGIONES Y PROCESARLAS
const processWarehouseRegions = (zonas) => {
  return zonas
    .map((zona) => {
      try {
        let processedCoordinates = zona.poligono_coordenadas;

        // Validación más estricta del formato de coordenadas
        if (
          !Array.isArray(processedCoordinates) ||
          processedCoordinates.length < 3 || // Un polígono válido necesita al menos 3 puntos
          !processedCoordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              !isNaN(coord[0]) &&
              !isNaN(coord[1])
          )
        ) {
          throw new Error(`Formato inválido de coordenadas para zona ${zona.id}`);
        }

        // Asegurar que el polígono esté cerrado (primer y último punto iguales)
        const first = processedCoordinates[0];
        const last = processedCoordinates[processedCoordinates.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          processedCoordinates = [...processedCoordinates, first];
        }

        // Verificar que el polígono sea válido
        const polygon = turf.polygon([processedCoordinates]);
        if (!turf.booleanValid(polygon)) {
          throw new Error(`Polígono inválido para zona ${zona.id}`);
        }

        return {
          warehouseId: zona.id,
          name: zona.nombre,
          polygon: polygon,
          centroid: turf.centroid(polygon).geometry.coordinates
        };
      } catch (error) {
        console.error(`Error procesando zona ${zona.id}:`, error);
        return null;
      }
    })
    .filter((region) => region !== null);
};

//CALCULO DE LA ZONA
const determineWorkZone = (warehouseRegions, coordinates, maxDistanceKm = 50) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error("Formato de coordenadas inválido");
  }

  const point = turf.point(coordinates);
  let closestRegion = null;
  let minDistance = Infinity;

  // Primero verificar si el punto está dentro de alguna región
  for (const region of warehouseRegions) {
    try {
      const isInside = turf.booleanPointInPolygon(point, region.polygon);
      if (isInside) {
        // Verificar también la distancia al centroide para mayor precisión
        const distanceToCentroid = turf.distance(point, turf.point(region.centroid));
        if (distanceToCentroid < minDistance) {
          minDistance = distanceToCentroid;
          closestRegion = region;
        }
      }
    } catch (error) {
      console.error(`Error verificando región ${region.name}:`, error);
    }
  }

  // Si encontramos una región que contiene el punto
  if (closestRegion) {
    return closestRegion.warehouseId;
  }

  // Si no está dentro de ninguna región, verificar la región más cercana
  for (const region of warehouseRegions) {
    try {
      const distance = turf.distance(point, turf.point(region.centroid));
      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }
    } catch (error) {
      console.error(`Error calculando distancia a región ${region.name}:`, error);
    }
  }

  // Solo devolver la región más cercana si está dentro del radio máximo permitido
  return minDistance <= maxDistanceKm ? closestRegion?.warehouseId : null;
};

//OBTENER LA ZONA DE TRABAJO
export const getZonaTrabajo = (zonas, coordinates, maxDistanceKm = 50) => {
  try {
    // Validar coordenadas de entrada
    const [longitude, latitude] = coordinates;
    if (isNaN(longitude) || isNaN(latitude) || 
        longitude < -180 || longitude > 180 || 
        latitude < -90 || latitude > 90) {
      throw new Error("Coordenadas inválidas");
    }

    // Procesar las regiones
    const warehouseRegions = processWarehouseRegions(zonas);
    if (warehouseRegions.length === 0) {
      throw new Error("No hay regiones válidas para evaluar");
    }

    // Determinar la zona de trabajo con distancia máxima configurable
    const zona_trabajo_id = determineWorkZone(warehouseRegions, coordinates, maxDistanceKm);

    return zona_trabajo_id;
  } catch (error) {
    console.error('Error al determinar la zona de trabajo:', error);
    return null;
  }
};

//CATEGORIA ESPECIFICA PARA NUESTRO ENDPOINT NECESARIO PARA TRAER UNA CATEGORIA EN ESPECIFICO
export const getCategoriaControllerIdGW = async (req, res) => {
  try {
    //const id = req.params.id || 1;
    //const { ubicacion_id } = req.params;
    let { id, ubicacion_id } = req.params;
    id = id || '1';

     const MAX_DISTANCE_KM = 50; // Radio máximo en kilómetros

    //ZONA DE TRABAJO VARIABLE
    let zona_trabajo_id = null;

    if (ubicacion_id) {
      try {
        // Obtener la información de la ubicación
        const ubicacionRes = await axios.get(
          `${service_ubicacion}/ubicacion/${ubicacion_id}`
        );

        const latitud = ubicacionRes.data.latitud;
        const longitud = ubicacionRes.data.longitud;

        if (!latitud || !longitud) {
          return res.status(400).json({ message: "Coordenadas no disponibles" });
        }

        // Obtener zonas para calcular la zona de trabajo
        const responseZona = await axios.get(`${service_ubicacion}/zona`);

        // Solo necesitamos coordenadas y zonas para determinar la zona_trabajo_id
         const coordinates = [longitud, latitud];
        

        // Usar la función existente para determinar la zona de trabajo
        zona_trabajo_id = getZonaTrabajo(responseZona.data, coordinates, MAX_DISTANCE_KM);

        if (!zona_trabajo_id) {
          return res.status(404).json({
            message: "Ubicación fuera de las zonas de reparto",
            error: "ZONA_NO_DISPONIBLE"
          });
        }

        // Si es necesario, actualizar la zona de trabajo en la ubicación
        await axios.put(`${service_ubicacion}/ubicacion/${ubicacion_id}`, {
          zona_trabajo_id: zona_trabajo_id
        });
      } catch (error) {
        console.error('Error al procesar ubicación:', error);
        return res.status(404).json({ message: "Ubicación no encontrada o error al procesar" });
      }
    }

    // Obtener la categoría y subcategorías relacionadas con la nueva estructura
    const response = await axios.get(`${service_categoria}/categoria/${id}`);

    if (!response || !response.data) {
      return res.status(400).json({ message: "Invalid get data from GW" });
    }

    // Extraer la data con la nueva estructura
    const categoriaData = response.data;

    const enrichedData = {};

    enrichedData.id = categoriaData.id;
    enrichedData.nombre = categoriaData.nombre;
    enrichedData.zona_trabajo_id = zona_trabajo_id;

    // Para detener el flujo si algún producto o promoción no se encuentra (404)
    let sinProductosDisponibles = false;

    // Crear una copia del objeto para no modificar el original directamente
    enrichedData.subcategorias = await Promise.all(categoriaData.subcategorias.map(async (subcategoria) => {
      // Procesar array de productos
      const productosEnriquecidos = await Promise.all(subcategoria.productos.map(async (productoId) => {
        try {
          // Obtener detalles del producto y su precio de zona en paralelo
          const [productoResp, precioZonaResp,totalValoracionesResp,calificacionesResp] = await Promise.all([
            axios.get(`${service_producto}/producto/${productoId}`),
            axios.get(`${service_zonaproducto}/precioZonaProductoDetalle/${zona_trabajo_id}/${productoId}`),
            axios.get(`${service_cliente}/calificacion_count_producto/${productoId}`),
            axios.get(`${service_cliente}/last_valoraciones_cliente_producto/${productoId}`)
          ]);

          const productoDetalle = productoResp.data || null;
          const precioZonaProducto = precioZonaResp.data || null;

          // Filtrar productos no disponibles
          if (!precioZonaProducto?.disponible) {
            return null;
          }

          //total de calificaciones de los clientes al producto
          const totalValoraciones = totalValoracionesResp.data?.total_valoraciones || 0;
          console.log("------------------->");
          console.log(totalValoraciones);

          const calificaciones = calificacionesResp.data || [];

          // Calcular el porcentaje de descuento si hay descuento y precio
          /*
          let porcentajeDescuento = null;
          if (precioZonaProducto?.descuento > 0 && precioZonaProducto?.precio_regular > 0) {
            porcentajeDescuento = Math.round((precioZonaProducto.descuento / precioZonaProducto.precio_regular) * 100);
          }*/

          // Estructura modificada para el estilo
          const estiloModificado = precioZonaProducto ? {
            id: precioZonaProducto.estilo_id,
            colores: [
              { color_fondo: precioZonaProducto.color_fondo },
              { color_boton: precioZonaProducto.color_boton },
              { color_letra: precioZonaProducto.color_letra }
            ]
          } : null;

          // Extraer solo la información necesaria
          const productoEnriquecido = {
            id: productoId,
            nombre: productoDetalle?.nombre || null,
            descripcion: productoDetalle?.descripcion || null,
            tipo_empaque: productoDetalle?.tipo_empaque || null,
            cantidad_unidad: productoDetalle?.cantidad_unidad || null,
            unidad_medida: productoDetalle?.unidad_medida || null,
            volumen_unidad: productoDetalle?.volumen_unidad || null,
            foto: productoDetalle?.foto,
            valoracion: productoDetalle?.valoracion || null,
            precio_regular: precioZonaProducto?.precio_regular || null,
            descuento: precioZonaProducto?.descuento || 0,
            precio_normal: precioZonaProducto?.precio_normal || null,
            total_cliente_calificacion: Number(totalValoraciones),
            estilo: estiloModificado,
            calificaciones: calificaciones
          };

          // Añadir el porcentaje de descuento solo si existe un descuento
          /*
          if (porcentajeDescuento !== null) {
            productoEnriquecido.porcentaje_descuento = porcentajeDescuento;
          }*/

          return productoEnriquecido;
        } catch (error) {
          /*
          if (error.response?.status === 404) {
            sinProductosDisponibles = true;
          }*/
          console.error(`Error al obtener detalles del producto ${productoId}:`, error.message);
          return null;
        }
      }));

      // Procesar array de promociones
      const promocionesEnriquecidas = await Promise.all(subcategoria.promociones.map(async (promocionId) => {
        try {
          // Obtener detalles de la promoción y su precio de zona en paralelo
          const [promoResp, precioPromoResp,totalValoracionResp,calificacionResp] = await Promise.all([
            axios.get(`${service_producto}/promocion/${promocionId}`),
            axios.get(`${service_zonapromocion}/preciopromodetalle/${zona_trabajo_id}/${promocionId}`),
            axios.get(`${service_cliente}/calificacion_promedio_promocion/${promocionId}`),
            axios.get(`${service_cliente}/last_valoraciones_cliente_promos/${promocionId}`)
          ]);

          const promocionDetalle = promoResp.data || null;
          //console.log("---------------------->");
          //console.log(promocionDetalle);
          const precioZonaPromocion = precioPromoResp.data || null;
          // Filtrar promociones no disponibles
          if (!precioZonaPromocion?.disponible) {
            return null;
          }

          const totalValoracion = totalValoracionResp.data?.total_valoraciones || 0;
          console.log("------------------->");
          console.log(totalValoracion);
          const calificaciones =  calificacionResp.data || [];

          // Calcular el porcentaje de descuento si hay descuento y precio
          /*
          let porcentajeDescuento = null;
          if (precioZonaPromocion?.descuento > 0 && precioZonaPromocion?.precio_regular > 0) {
            porcentajeDescuento = Math.round((precioZonaPromocion.descuento / precioZonaPromocion.precio_regular) * 100);
          }*/

          // Estructura modificada para el estilo
          const estiloModificado = precioZonaPromocion ? {
            id: precioZonaPromocion.estilo_id,
            colores: [
              { color_fondo: precioZonaPromocion.color_fondo },
              { color_boton: precioZonaPromocion.color_boton },
              { color_letra: precioZonaPromocion.color_letra }
            ]
          } : null;

          // Extraer solo la información necesaria
          const promocionEnriquecida = {
            id: promocionId,
            nombre: promocionDetalle?.nombre || null,
            descripcion: promocionDetalle.descripcion || null,
            foto: promocionDetalle?.foto,
            valoracion: promocionDetalle?.valoracion || null,
            precio_regular: precioZonaPromocion?.precio_regular || null,
            descuento: precioZonaPromocion?.descuento || 0,
            precio_normal: precioZonaPromocion?.precio_normal || null,
            total_cliente_calificacion: Number(totalValoracion), 
            estilo: estiloModificado,
            calificaciones:  calificaciones
          };

          // Añadir el porcentaje de descuento solo si existe un descuento
          /*
          if (porcentajeDescuento !== null) {
            promocionEnriquecida.porcentaje_descuento = porcentajeDescuento;
          }*/

          return promocionEnriquecida;
          
        } catch (error) {
          /*
          if (error.response?.status === 404) {
            sinProductosDisponibles = true;
          }*/
          console.error(`Error al obtener detalles de la promoción ${promocionId}:`, error.message);
          return null;
        }
      }));
      // Filtrar elementos nulos (no disponibles)
      const productosValidos = productosEnriquecidos.filter(p => p !== null);
      const promocionesValidas = promocionesEnriquecidas.filter(p => p !== null);


      // Devolver la subcategoría con productos y promociones enriquecidos
      return {
        ...subcategoria,
        productos: productosValidos,
        promociones: promocionesValidas
      };
    }));
    
    // Verificación final: si hubo productos o promociones que no existen
    if (sinProductosDisponibles) {
      return res.status(404).json({
        zona_trabajo_id,
        message: "No hay productos disponibles para esta zona"
      });
    }
    res.status(200).json(enrichedData);
  } catch (error) {
    console.error('Error en getCategoriaControllerIdGW:', error);
    res.status(500).json({ error: error.message });
  }
};

//ALL PRODUCTOS Y PROMOCIONES CON SUBCATEGORIA ESPECIFICA 
export const getAllProductosSubcategoriaGW = async (req, res) => {
  try {
    const { subcategoria_id, zona_trabajo_id } = req.params;

    // Obtener subcategoría con productos y promociones (IDs)
    const response = await axios.get(`${service_categoria}/all_productos_subcategoria/${subcategoria_id}`);
    if (!response || !response.data) {
      return res.status(400).json({ message: "Invalid get data from GW" });
    }

    const subcategoria = response.data;

    // Enriquecer productos
    const productosEnriquecidos = await Promise.all(
      subcategoria.productos.map(async (productoId) => {
        try {
          const [
            productoResp,
            precioZonaResp,
            totalValoracionesResp,
            calificacionesResp
          ] = await Promise.all([
            axios.get(`${service_producto}/producto/${productoId}`),
            axios.get(`${service_zonaproducto}/precioZonaProductoDetalle/${zona_trabajo_id}/${productoId}`),
            axios.get(`${service_cliente}/calificacion_count_producto/${productoId}`),
            axios.get(`${service_cliente}/last_valoraciones_cliente_producto/${productoId}`)
          ]);

          const productoDetalle = productoResp.data || null;
          const precioZonaProducto = precioZonaResp.data || null;
          const totalValoraciones = totalValoracionesResp.data?.total_valoraciones || 0;
          const calificaciones = calificacionesResp.data || [];

          /*
          let porcentajeDescuento = null;
          if (precioZonaProducto?.descuento > 0 && precioZonaProducto?.precio > 0) {
            porcentajeDescuento = Math.round((precioZonaProducto.descuento / precioZonaProducto.precio) * 100);
          }*/

          const estiloModificado = precioZonaProducto ? {
            id: precioZonaProducto.estilo_id,
            colores: [
              { color_fondo: precioZonaProducto.color_fondo },
              { color_boton: precioZonaProducto.color_boton },
              { color_letra: precioZonaProducto.color_letra }
            ]
          } : null;

          const productoEnriquecido = {
            id: productoId,
            nombre: productoDetalle?.nombre || null,
            descripcion: productoDetalle?.descripcion || null,
            tipo_empaque: productoDetalle?.tipo_empaque || null,
            cantidad_unidad: productoDetalle?.cantidad_unidad || null,
            unidad_medida: productoDetalle?.unidad_medida || null,
            volumen_unidad: productoDetalle?.volumen_unidad || null,
            foto: productoDetalle?.foto,
            valoracion: productoDetalle?.valoracion || null,
            precio_regular: precioZonaProducto?.precio_regular || null,
            descuento: precioZonaProducto?.descuento || 0,
            precio_normal: precioZonaProducto?.precio_normal || null,
            total_cliente_calificacion: Number(totalValoraciones),
            estilo: estiloModificado,
            calificaciones: calificaciones
          };
          /*
          if (porcentajeDescuento !== null) {
            productoEnriquecido.porcentaje_descuento = porcentajeDescuento;
          }*/

          return productoEnriquecido;
        } catch (error) {
          console.error(`Error al obtener detalles del producto ${productoId}:`, error.message);
          return { id: productoId, error: 'No se pudo obtener información' };
        }
      })
    );

    // Enriquecer promociones
    const promocionesEnriquecidas = await Promise.all(
      subcategoria.promociones.map(async (promocionId) => {
        try {
          const [
            promoResp,
            precioPromoResp,
            totalValoracionResp,
            calificacionResp
          ] = await Promise.all([
            axios.get(`${service_producto}/promocion/${promocionId}`),
            axios.get(`${service_zonapromocion}/preciopromodetalle/${zona_trabajo_id}/${promocionId}`),
            axios.get(`${service_cliente}/calificacion_promedio_promocion/${promocionId}`),
            axios.get(`${service_cliente}/last_valoraciones_cliente_promos/${promocionId}`)
          ]);

          const promocionDetalle = promoResp.data || null;
          const precioZonaPromocion = precioPromoResp.data || null;
          const totalValoracion = totalValoracionResp.data?.total_valoraciones || 0;
          const calificaciones = calificacionResp.data || [];
          /*
          let porcentajeDescuento = null;
          if (precioZonaPromocion?.descuento > 0 && precioZonaPromocion?.precio > 0) {
            porcentajeDescuento = Math.round((precioZonaPromocion.descuento / precioZonaPromocion.precio) * 100);
          }*/

          const estiloModificado = precioZonaPromocion ? {
            id: precioZonaPromocion.estilo_id,
            colores: [
              { color_fondo: precioZonaPromocion.color_fondo },
              { color_boton: precioZonaPromocion.color_boton },
              { color_letra: precioZonaPromocion.color_letra }
            ]
          } : null;

          const promocionEnriquecida = {
            id: promocionId,
            nombre: promocionDetalle?.nombre || null,
            descripcion: promocionDetalle?.descripcion || null,
            foto: promocionDetalle?.foto,
            valoracion: promocionDetalle?.valoracion || null,
            precio_regular: precioZonaPromocion?.precio_regular || null,
            descuento: precioZonaPromocion?.descuento || 0,
            precio_normal: precioZonaPromocion?.precio_normal || null,
            total_cliente_calificacion: Number(totalValoracion),
            estilo: estiloModificado,
            calificaciones: calificaciones
          };
          /*
          if (porcentajeDescuento !== null) {
            promocionEnriquecida.porcentaje_descuento = porcentajeDescuento;
          }*/

          return promocionEnriquecida;
        } catch (error) {
          console.error(`Error al obtener detalles de la promoción ${promocionId}:`, error.message);
          return { id: promocionId, error: 'No se pudo obtener información' };
        }
      })
    );

    // Devolver resultado final
    return res.json({
      ...subcategoria,
      productos: productosEnriquecidos,
      promociones: promocionesEnriquecidas
    });

  } catch (error) {
    console.error("Error general al procesar la subcategoría:", error.message);
    return res.status(500).json({ message: "Error al obtener información de subcategoría" });
  }
};


//TODAS LAS CATEGORIAS Y SU RESPECTIVA ZONA
export const getZonaYCategoriasController = async (req, res) => {
  try {
    const { ubicacion_id } = req.params;
    const MAX_DISTANCE_KM = 50;
    let zona_trabajo_id = null;

    if (!ubicacion_id) {
      return res.status(400).json({ message: "ubicacion_id es requerido" });
    }

    try {
      const ubicacionRes = await axios.get(`${service_ubicacion}/ubicacion/${ubicacion_id}`);
      const { latitud, longitud } = ubicacionRes.data;

      if (!latitud || !longitud) {
        return res.status(400).json({ message: "Coordenadas no disponibles" });
      }

      const responseZona = await axios.get(`${service_ubicacion}/zona`);
      const coordinates = [longitud, latitud];

      zona_trabajo_id = getZonaTrabajo(responseZona.data, coordinates, MAX_DISTANCE_KM);

      if (!zona_trabajo_id) {
        return res.status(404).json({
          message: "Ubicación fuera de las zonas de reparto",
          error: "ZONA_NO_DISPONIBLE"
        });
      }

      // Actualizar la zona en la ubicación
      await axios.put(`${service_ubicacion}/ubicacion/${ubicacion_id}`, {
        zona_trabajo_id
      });

    } catch (error) {
      console.error("Error al procesar ubicación:", error.message);
      return res.status(404).json({ message: "Ubicación no encontrada o error al procesar" });
    }

    // Obtener todas las categorías
    try {
      const categoriasRes = await axios.get(`${service_categoria}/categoria`);
      return res.status(200).json({
        zona_trabajo_id,
        categorias: categoriasRes.data
      });
    } catch (error) {
      console.error("Error al obtener categorías:", error.message);
      return res.status(500).json({ message: "Error al obtener categorías" });
    }

  } catch (error) {
    console.error("Error en getZonaYCategoriasController:", error.message);
    res.status(500).json({ error: error.message });
  }
};



//ENDPOINT QUE ME TRAE TODAS LA CATEGORIA CON TODAS SUS SUBCATEGORIAS Y PRODUCTOS
export const getCategoriaSubcategoriaControllerIdGW = async (req, res) => {
  try {
    let { id, zona_trabajo_id } = req.params;
    if (!zona_trabajo_id) {
      return res.status(400).json({
        message: "El parámetro zona_trabajo_id es requerido."
      });
    }
    // Obtener la categoría y subcategorías relacionadas con la nueva estructura
    const response = await axios.get(`${service_categoria}/allcategorias_subcategorias/${id}`);
    if (!response || !response.data) {
      return res.status(400).json({ message: "Invalid get data from GW" });
    }
    const categoriaData = response.data;
    const enrichedData = {
      id: categoriaData.id,
      nombre: categoriaData.nombre,
      zona_trabajo_id: Number(zona_trabajo_id),
    };
    //let sinProductosDisponibles = false;
    enrichedData.subcategorias = await Promise.all(categoriaData.subcategorias.map(async (subcategoria) => {
      const productosEnriquecidos = await Promise.all(subcategoria.productos.map(async (productoId) => {
        try {
          const [productoResp, precioZonaResp, totalValoracionesResp, calificacionesResp] = await Promise.all([
            axios.get(`${service_producto}/producto/${productoId}`),
            axios.get(`${service_zonaproducto}/precioZonaProductoDetalle/${zona_trabajo_id}/${productoId}`),
            axios.get(`${service_cliente}/calificacion_count_producto/${productoId}`),
            axios.get(`${service_cliente}/last_valoraciones_cliente_producto/${productoId}`)
          ]);

          const productoDetalle = productoResp.data || null;
          const precioZonaProducto = precioZonaResp.data || null;
          
           if (!precioZonaProducto?.disponible) {
            return null;
          }
          
          const totalValoraciones = totalValoracionesResp.data?.total_valoraciones || 0;
          const calificaciones = calificacionesResp.data || [];
          /*
          let porcentajeDescuento = null;
          if (precioZonaProducto?.descuento > 0 && precioZonaProducto?.precio > 0) {
            porcentajeDescuento = Math.round((precioZonaProducto.descuento / precioZonaProducto.precio) * 100);
          }*/
          const estiloModificado = precioZonaProducto ? {
            id: precioZonaProducto.estilo_id,
            colores: [
              { color_fondo: precioZonaProducto.color_fondo },
              { color_boton: precioZonaProducto.color_boton },
              { color_letra: precioZonaProducto.color_letra }
            ]
          } : null;
          const productoEnriquecido = {
            id: productoId,
            nombre: productoDetalle?.nombre || null,
            descripcion: productoDetalle?.descripcion || null,
            tipo_empaque: productoDetalle?.tipo_empaque || null,
            cantidad_unidad: productoDetalle?.cantidad_unidad || null,
            unidad_medida: productoDetalle?.unidad_medida || null,
            volumen_unidad: productoDetalle?.volumen_unidad || null,
            foto: productoDetalle?.foto,
            valoracion: productoDetalle?.valoracion || null,
            precio_regular: precioZonaProducto?.precio_regular || null,
            descuento: precioZonaProducto?.descuento || 0,
            precio_normal: precioZonaProducto?.precio_normal || null,
            total_cliente_calificacion: Number(totalValoraciones),
            estilo: estiloModificado,
            calificaciones: calificaciones
          };
          /*if (porcentajeDescuento !== null) {
            productoEnriquecido.porcentaje_descuento = porcentajeDescuento;
          }*/
          return productoEnriquecido;
        } catch (error) {
          /*
          if (error.response?.status === 404) {
            sinProductosDisponibles = true;
          }*/
          console.error(`Error al obtener detalles del producto ${productoId}:`, error.message);
          return null;
        }
      }));
      const promocionesEnriquecidas = await Promise.all(subcategoria.promociones.map(async (promocionId) => {
        try {
          const [promoResp, precioPromoResp, totalValoracionResp, calificacionResp] = await Promise.all([
            axios.get(`${service_producto}/promocion/${promocionId}`),
            axios.get(`${service_zonapromocion}/preciopromodetalle/${zona_trabajo_id}/${promocionId}`),
            axios.get(`${service_cliente}/calificacion_promedio_promocion/${promocionId}`),
            axios.get(`${service_cliente}/last_valoraciones_cliente_promos/${promocionId}`)
          ]);
          const promocionDetalle = promoResp.data || null;
          const precioZonaPromocion = precioPromoResp.data || null;
          if (!precioZonaPromocion?.disponible) {
            return null;
          }
          const totalValoracion = totalValoracionResp.data?.total_valoraciones || 0;
          const calificaciones = calificacionResp.data || [];
/*
          let porcentajeDescuento = null;
          if (precioZonaPromocion?.descuento > 0 && precioZonaPromocion?.precio > 0) {
            porcentajeDescuento = Math.round((precioZonaPromocion.descuento / precioZonaPromocion.precio) * 100);
          }
 */
          const estiloModificado = precioZonaPromocion ? {
            id: precioZonaPromocion.estilo_id,
            colores: [
              { color_fondo: precioZonaPromocion.color_fondo },
              { color_boton: precioZonaPromocion.color_boton },
              { color_letra: precioZonaPromocion.color_letra }
            ]
          } : null;
          const promocionEnriquecida = {
            id: promocionId,
            nombre: promocionDetalle?.nombre || null,
            descripcion: promocionDetalle?.descripcion || null,
            foto: promocionDetalle?.foto,
            valoracion: promocionDetalle?.valoracion || null,
            precio_regular: precioZonaPromocion?.precio_regular || null,
            descuento: precioZonaPromocion?.descuento || 0,
            precio_normal: precioZonaPromocion?.precio_normal || null,
            total_cliente_calificacion: Number(totalValoracion),
            estilo: estiloModificado,
            calificaciones: calificaciones
          };
          /*
          if (porcentajeDescuento !== null) {
            promocionEnriquecida.porcentaje_descuento = porcentajeDescuento;
          }*/
          return promocionEnriquecida;
        } catch (error) {
          /*
          if (error.response?.status === 404) {
            sinProductosDisponibles = true;
          }*/
          console.error(`Error al obtener detalles de la promoción ${promocionId}:`, error.message);
          return null;
        }
      }));
      const productosValidos = productosEnriquecidos.filter(p => p !== null);
      const promocionesValidas = promocionesEnriquecidas.filter(p => p !== null);

      return {
        ...subcategoria,
        productos: productosValidos,
        promociones: promocionesValidas
      };
    }));
    /*
    if (sinProductosDisponibles) {
      return res.status(404).json({
        zona_trabajo_id,
        message: "No hay productos disponibles para esta zona"
      });
    }*/
    res.status(200).json(enrichedData);
  } catch (error) {
    console.error('Error en getCategoriaSubcategoriaControllerIdGW:', error);
    res.status(500).json({ error: error.message });
  }
};



