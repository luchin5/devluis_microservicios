import axios from 'axios';
//import redisClient from '../index.js';
import dotenv from 'dotenv'
import * as turf from "@turf/turf";


dotenv.config()

const service_ubicacion = process.env.MICRO_UBICACION

export const getUbicacionesControllerIdGW = async (req,res) => {
    
    // REDIS
    const cacheKey = `ubicacion_id_cache`; // Clave específica por ID
    
    //let cacheData;
    
    //try {
      /*  
      cacheData = await redisClient.get(cacheKey)
        console.log("Dato de caché:",cacheData)
    } catch (redisError) {
        console.error("Error al obtener datos de Redis:",redisError.message)
    }

    if(cacheData){
        return res.status(200).json(JSON.parse(cacheData))
    }*/

    // AXIOS - BD
    try {
        const { id } = req.params
        /*
        console.log(id,".....id")
        console.log(`${service_ubicacion}/ubicacion/${id}`)
        const response = await axios.get(`${service_ubicacion}/ubicacion/${id}`)
        console.log(response.data,"---------------ubicacion id")
        */
        if(response && response.data){
            /*
            try {
                await redisClient.setEx(cacheKey,3600,JSON.stringify(response.data))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:",redisSetError.message)
            }*/
            
            res.status(200).json(response.data);
        }else{
            res.status(404).json({ message: 'Not found '})
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }

}

export const ubicacionClienteControllerGW = async (req, res) => {
  try {
    const { latitud, longitud } = req.body;

    if (!latitud || !longitud) {
      return res.status(400).json({ message: "Coordenadas inválidas o incompletas." });
    }

    const MAX_DISTANCE_KM = 50;

    // Obtener zonas de trabajo
    const responseZona = await axios.get(`${service_ubicacion}/zona`);
    const zonaTrabajo = getZonaTrabajo(responseZona.data, [longitud, latitud], MAX_DISTANCE_KM);

    // Si no se encuentra zona de trabajo, no se realiza el post
    if (!zonaTrabajo) {
      return res.status(400).json({
        message: "Ubicación fuera de las zonas de reparto.",
        error: "ZONA_NO_DISPONIBLE"
      });
    }

    // Hacer POST de la ubicación
    const postResponse = await axios.post(
      `${service_ubicacion}/ubicacion_cliente`,
      req.body
    );

    if (postResponse && postResponse.data) {
      const ubicacionCreada = postResponse.data;

      // Hacer PUT para actualizar zona_trabajo_id
      const putResponse = await axios.put(
        `${service_ubicacion}/ubicacion/${ubicacionCreada.id}`,
        { zona_trabajo_id: zonaTrabajo }
      );

      // Devolver ubicación con zona actualizada
      return res.status(201).json({
        ...ubicacionCreada,
        zona_trabajo_id: zonaTrabajo
      });
    } else {
      return res.status(400).json({ message: "Datos inválidos para ubicación" });
    }

  } catch (error) {
    console.error("Error creando ubicación:", error.message);
    return res.status(500).json({ error: "Error creando ubicación" });
  }
};

//VERIFICACION DE UBICACION
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



//ENDPOINT QUE TRAE LA UBICACION DEL CLIENTE QUE INGRESO EN SU APP
export const getUltimaUbicacionClienteControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const MAX_DISTANCE_KM = 50; 
    let zona_trabajo_id = null;

    if (!id) {
      return res.status(400).json({ message: "ID de cliente no proporcionado" });
    }

    try {
      // Obtener la última ubicación del cliente
      const ubicacionRes = await axios.get(`${service_ubicacion}/ultima_ubicacion/${id}`);
      const ubicacion = ubicacionRes.data;

      const {
        id: ubicacion_id,
        latitud,
        longitud,
        cliente_id,
        etiqueta,
        departamento,
        provincia,
        distrito,
        direccion
      } = ubicacion;

      // Validar coordenadas
      if (!latitud || !longitud) {
        return res.status(400).json({ message: "Coordenadas no disponibles" });
      }

      // Obtener todas las zonas de trabajo
      const responseZona = await axios.get(`${service_ubicacion}/zona`);
      const coordinates = [longitud, latitud];

      // Determinar la zona de trabajo usando tu función
      zona_trabajo_id = getZonaTrabajo(responseZona.data, coordinates, MAX_DISTANCE_KM);

      // Validar zona
      if (!zona_trabajo_id) {
        return res.status(404).json({
          message: "Ubicación fuera de las zonas de reparto",
          error: "ZONA_NO_DISPONIBLE"
        });
      }

      // Actualizar la zona de trabajo en la ubicación
      await axios.put(`${service_ubicacion}/ubicacion/${ubicacion_id}`, {
        zona_trabajo_id: zona_trabajo_id
      });

      // Enviar respuesta con datos solicitados
      return res.status(200).json({
        id: ubicacion_id,
        departamento,
        provincia,
        distrito,
        direccion,
        latitud,
        longitud,
        cliente_id,
        zona_trabajo_id,
        etiqueta
      });

    } catch (error) {
      console.error('Error al procesar ubicación:', error.message);
      return res.status(404).json({ message: "Ubicación no encontrada o error al procesar" });
    }

  } catch (error) {
    console.error('Error general:', error.message);
    return res.status(500).json({ error: error.message });
  }
};




//ENDPOINT QUE SIRVE PARA ACTUALIZAR LA UBICACIÓN DEL CLIENTE QUE INGRESO EN SU APP
export const actualizarUltimaUbicacionClienteControllerGW = async (req,res) => {
        try {
          const { id } = req.params;
          const response = await axios.put(
            `${service_ubicacion}/actualizar_ubicacion/${id}`,
            req.body
          );
         
          if (response) {
            res.status(200).json(response.data);
          } else {
            res.status(400).json({ message: "Invalid put data" });
          }
        } catch (error) {
          res.status(500).send("Error PUT cliente");
        }
}



//ENDPOINT QUE TRAE TODAS LAS UBICACIONES REGISTRADAS POR EL CLIENTE EN SU APP
export const getAllUbicacionesClienteControllerGW = async (req, res) => {//Add commentMore actions
  try {
    const { cliente } = req.params;
    const response = await axios.get(`${service_ubicacion}/all_ubicacion/${cliente}`);
    return res.status(200).json(response.data);

  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Data not found." });
    }
return res.status(500).json({ error: error.message });
  }
};

//ENDPOINT PARA ELIMINAR UNA UBICACION EN ESPECIFICA
export const eliminarUbicacionClienteControllerGW = async (req,res) => {
        try {
          const { id } = req.params;
          const response = await axios.delete(
            `${service_ubicacion}/ubicacion/${id}`
          );
         
          if (response) {
            res.status(200).json(response.data);
          } else {
            res.status(400).json({ message: "Invalid delete data" });
          }
        } catch (error) {
          res.status(500).send("Error DELETE data");
        }
}


//ALL DEPARTAMENTOS DISPONIBLES
export const allDepartamentosControllerGW = async (req,res) => {
        try {
          const response = await axios.get(
            `${service_ubicacion}/departamentos`
          );
         
          if (response) {
            res.status(200).json(response.data);
          } else {
            res.status(404).json({ message: "Invalid get data" });
          }
        } catch (error) {
          res.status(500).send("Error get data");
        }
}
//APIKEY DE GOOGLE
export const getGoogleMapsApiKeyController = async (req, res) => {
  try {
    // Aquí puedes usar variables de entorno o cargar desde un servicio de config
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'clave_default';

    res.status(200).json({
      google_maps_api_key: mapsApiKey
    });
  } catch (error) {
    res.status(500).json({
      error: "No se pudo obtener la API key",
      details: error.message
    });
  }
};

//OBTENER LAS COORDENADAS
export const getCoordsByAddressControllerGW = async (req, res) => {
  const { direccion } = req.query;

  if (!direccion) {
    return res.status(400).json({ error: "Parámetro 'direccion' requerido" });
  }

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address: direccion,
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: "es",
        region: "pe"
      }
    });

    const { status, results, error_message } = response.data;

    if (status === "OK") {
      const { lat, lng } = results[0].geometry.location;
      return res.json({ lat, lng });
    }

    return res.status(400).json({
      error: `Error de Google: ${status}`,
      detalles: error_message || "Verifica tu API Key y permisos"
    });

  } catch (error) {
    console.error("Error en geocoding:", error);
    return res.status(500).json({ 
      error: "Error interno",
      detalles: "Revisa logs del servidor"
    });
  }
};


export const getTemperaturaController = async (req, res) => {
  const openweaApiKey = process.env.OPEN_WEATHER || '08607bf479e5f47f5b768154953d10f6';

  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'Debe proporcionar el nombre de una ciudad como query, por ejemplo: ?city=Arequipa' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openweaApiKey}&units=metric&lang=es`;
    const response = await axios.get(url);
    const data = response.data;

    const temp = Math.round(data.main.temp); // 👈 Cambio clave aquí
    let mensaje = '';

    if (temp >= 30) {
      mensaje = '¡Uff, qué calor! Buen momento para hidratarse bien y mantenerse fresco.';
    } else if (temp >= 15) {
      mensaje = 'Qué buen clima, ideal para estar activo. ¡No olvides hidratarte!';
    } else {
      mensaje = 'Hace frío, abrígate bien y mantente hidratado aunque no tengas sed.';
    }

    res.status(200).json({
      ciudad: data.name,
      temperatura: `${temp} °C`,
      mensaje: mensaje
    });

  } catch (error) {
    res.status(500).json({
      error: 'No se pudo obtener el clima',
      detalles: error.response?.data || error.message
    });
  }
};
//ALL DISTRITOS
export const allDistritosControllerGW = async (req,res) => {
        try {
          const {id} = req.params;
          const response = await axios.get(
            `${service_ubicacion}/distritos/${id}`
          );
         
          if (response) {
            res.status(200).json(response.data);
          } else {
            res.status(404).json({ message: "Invalid get data" });
          }
        } catch (error) {
          res.status(500).send("Error get data");
        }
}