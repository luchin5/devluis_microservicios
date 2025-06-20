import axios from "axios";
//import redisClient from "../index.js";
import dotenv from "dotenv";

dotenv.config();

const service_conductor = process.env.MICRO_CONDUCTOR;
const service_pedido = process.env.MICRO_PEDIDO;
const service_cliente = process.env.MICRO_CLIENTE;
const service_ubicacion = process.env.MICRO_UBICACION;
const service_auth = process.env.MICRO_AUTH;

export const getConductoresControllerGW = async (req, res) => {
  console.log("......get conductor controller");
  //const cacheKey = "conductores_cache";
  try {
    /*
    console.log("........Intentando obtener datos de Redis");
    let cachedData;
    try {
      cachedData = await redisClient.get(cacheKey);
      console.log("Datos de caché:", cachedData);
    } catch (redisError) {
      console.error("Error al obtener datos de Redis:", redisError.message);
    }

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }
*/
    const response = await axios.get(`${service_conductor}/conductor`);
    console.log("Respuesta de la API de conductor:", response.data);

    if (response && response.data) {
      /*
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data));
      } catch (redisSetError) {
        console.error(
          "Error al guardar datos en Redis:",
          redisSetError.message
        );
      }*/
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).send("Error fetching conductores");
  }
};

//Info Conductor
export const getConductoresControllerIdGW = async (req, res) => {
  // REDIS
  /*
  const cacheKey = `conductor_id_cache`; // Clave específica por ID
  let cacheData;

  try {
    cacheData = await redisClient.get(cacheKey);
    console.log("Dato de caché:", cacheData);
  } catch (redisError) {
    console.error("Error al obtener datos de Redis:", redisError.message);
  }

  if (cacheData) {
    return res.status(200).json(JSON.parse(cacheData));
  }*/

  // AXIOS - BD
  try {
    const { id } = req.params;
    console.log(id, ".....id");
    console.log(`${service_conductor}/conductor/${id}`);
    const response = await axios.get(`${service_conductor}/conductor/${id}`);
    console.log(response.data, "---------------client id");
    if (response && response.data) {
      /*
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data));
      } catch (redisSetError) {
        console.error(
          "Error al guardar datos en Redis:",
          redisSetError.message
        );
      }*/
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not found " });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postConductoresControllerGW = async (req, res) => {
  try {
    const response = await axios.post(
      `${service_conductor}/conductor`,
      req.body
    );
    if (response) {
      res.status(201).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error creating order");
  }
};

export const putConductoresControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, ".....id");
    console.log(`${service_conductor}/conductor/${id}`);
    const response = await axios.put(
      `${service_conductor}/conductor/${id}`,
      req.body
    );
    console.log(response.data, "---------conductores id");
    if (response) {
      res.status(201).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error creating driver");
  }
};

export const deleteConductoresControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, ".....id");
    console.log(`${service_conductor}/conductor/${id}`);
    const response = await axios.delete(`${service_conductor}/conductor/${id}`);
    console.log(response.data, "---------conductores id");
    if (response) {
      res.status(201).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error creating order");
  }
};

export const getEventoConductores = async (req, res) => {
  // AXIOS - BD
  try {
    const { id } = req.params;
    console.log(id, ".....id");
    //console.log(`${service_conductor}/conductor_evento/${id}`)
    const response = await axios.get(
      `${service_conductor}/conductor_evento/${id}`
    );
    //console.log(response.data,"---------------client id")
    if (response && response.data) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not found " });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cantidad de pedidos conductor

export const getConductorPedidos = async (req, res) => {
  try {
    const { idconductor } = req.params;

    /*const cacheKey = `pedidos_conductor_${idconductor}`;

        // Intentar obtener la respuesta desde Redis
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData)); // Devolver caché
        }*/

    // Si no hay caché, hacer la petición a la BD
    const response = await axios.get(
      `${service_pedido}/pedido_conteo/${idconductor}`
    );

    if (response && response.data) {
      // await redisClient.setEx(cacheKey, 30, JSON.stringify(response.data)); // Cache por 30s
      return res.status(200).json(response.data);
    } else {
      return res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Último pedido entregado

export const getLastPedido = async (req, res) => {
  try {
    const { idconductor } = req.params;

    // Obtener el último pedido del conductor
    const response = await axios
      .get(`${service_pedido}/pedido_conductor/${idconductor}`)
      .catch((error) => {
        console.log(
          "Error en la solicitud de pedido:",
          error.response ? error.response.status : error.message
        );
        return null;
      });

    if (!response || !response.data || Object.keys(response.data).length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }

    const pedidolast = response.data;
    const ubicacionID = pedidolast.ubicacion_id;

    // Obtener la ubicación del pedido
    const responseUbicacion = await axios
      .get(`${service_ubicacion}/ubicacion/${ubicacionID}`)
      .catch((error) => {
        console.log(
          "Error en la solicitud de ubicación:",
          error.response ? error.response.status : error.message
        );
        return null;
      });

    let distanciafinal = 0; // Valor por defecto en caso de no haber ubicación
    if (responseUbicacion && responseUbicacion.data) {
      const ubicaciondata = responseUbicacion.data;

      if (ubicaciondata.latitud && ubicaciondata.longitud) {
        // Cálculo de distancia solo si las coordenadas existen
        const refLat = -16.398791269800043; // AREQUIPA
        const refLon = -71.53690424714978;
        const R = 6371;

        const dLat = ((ubicaciondata.latitud - refLat) * Math.PI) / 180;
        const dLon = ((ubicaciondata.longitud - refLon) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((refLat * Math.PI) / 180) *
            Math.cos((ubicaciondata.latitud * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanciafinal = R * c;
      }
    }

    const conductorID = pedidolast.cliente_id;

    // Obtener datos del cliente
    const cliente = await axios
      .get(`${service_cliente}/cliente/${conductorID}`)
      .catch((error) => {
        console.log(
          "Error en la solicitud del cliente:",
          error.response ? error.response.status : error.message
        );
        return null;
      });

    const clientelast = cliente && cliente.data ? cliente.data : { nombre: "Desconocido", foto_cliente: null };

    return res.status(200).json({
      id: pedidolast.id,
      tipo: pedidolast.tipo,
      total: pedidolast.total,
      fecha: pedidolast.fecha,
      estado: pedidolast.estado,
      distanciakm: distanciafinal, // Siempre tendrá un valor
      cliente: {
        nombre: clientelast.nombre,
        foto: clientelast.foto_cliente,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
//ENPOINT QUE TRAE TODA LA INFO DE LOS PROVEEDORES
export const getProveedoresControllerGW = async (req, res) => {
  try {
    console.log("Obteniendo lista de conductores...");
    
    // Fetch conductores
    const responseconductores = await axios.get(`${service_conductor}/conductor`);
    
    // Process conductores to add phone numbers and pending orders
    const conductoresEnriquecidos = await Promise.all(
      responseconductores.data.map(async (conductor) => {
        try {
          // Fetch phone number for each conductor
          const telefonoResponse = await axios.get(`${service_auth}/user_telefonodistri/${conductor.usuario_id}`);
          
          // Fetch pending orders for each conductor
          const pedidosResponse = await axios.get(`${service_pedido}/pedido_distribuidores/${conductor.evento_id}`);
          
          // Return enriched conductor object
          return {
            ...conductor,
            telefono: telefonoResponse.data.telefono || 'No disponible',
            total_pedidos_pendientes: pedidosResponse.data.total_pedidos_pendientes || 0
          };
        } catch (error) {
          console.error(`Error procesando conductor ${conductor.usuario_id}:`, error.message);
          return {
            ...conductor,
            telefono: 'No disponible',
            total_pedidos_pendientes: 0
          };
        }
      })
    );

    // Return enriched conductores list
    return res.status(200).json(conductoresEnriquecidos);

  } catch (error) {
    console.error("Error al obtener conductores:", error.message);
    return res.status(500).json({ error: "Error al obtener conductores" });
  }
};
