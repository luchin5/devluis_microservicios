import axios from "axios";
//import redisClient from "../index.js";
import dotenv from 'dotenv'

dotenv.config()

const service_almacen = process.env.MICRO_ALMACEN

export const getAlmacenControllerIdGW = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${service_almacen}/almacen/${id}`);

    if (response && response.data) {
      res.status(200).json(response.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "Id not found" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

/// *********************************************

export const getAlmacenControllerGW = async (req, res) => {
  const cacheKey = "almacen_cache";

  // REDIS
  /* let cacheData;
     try {
         cacheData = await redisClient.get(cacheKey)
         console.log("Dato de caché", cacheData)
     } catch (redisError) {
         console.error("Error al obtener datos de Redis:", redisError.message)
     }
 
     //VERIFICAR DATA CACHE
     if (cacheData) {
         return res.status(200).json(JSON.parse(cacheData))
     }*/

  try {
    const response = await axios.get(`${service_almacen}/almacen`);
    if (response && response.data) {
      /* try {
                 await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data))
             } catch (redisSetError) {
                 console.error("Error al guardar datos en Redis:", redisSetError.message)
             }*/
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).send("Error fetching clients");
  }
};

export const postAlmacenControllerGW = async (req, res) => {
  try {
    const response = req.body;
    console.log(response, "<--------------data POST api gw");

    const resultado = await axios.post(`${service_almacen}/almacen`, response);
    console.log(resultado, "<------------micro almacen API GW");
    if (resultado && resultado.data) {
      res.status(201).json(resultado.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    console.log("----ERROR API GW");
    res.status(500).json({ error: error.message });
  }
};

export const putClienteControllerGW = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID esté presente
        if (!id) {
            return res.status(400).json({ message: 'ID del almacén es requerido' });
        }

        console.log(id, "....id");
        console.log(`${service_almacen}/almacen/${id}`);

        // Realizar la solicitud al microservicio ALMACÉN
        const response = await axios.put(`${service_almacen}/almacen/${id}`, req.body);

        // Verificar si la respuesta del microservicio es válida
        if (response && response.data) {
            console.log(response.data, "<--------------data PUT api gw");
            return res.status(200).json(response.data);
        } else {
            return res.status(400).json({ message: 'Datos inválidos recibidos desde el microservicio' });
        }
    } catch (error) {
        console.error(`Error en putClienteControllerGW: ${error.message}`);
        
        // Respuesta más detallada en caso de error
        if (error.response) {
            // Error desde el microservicio (e.g., 404 o 500)
            return res.status(error.response.status).json({
                message: `Error en el microservicio ALMACÉN: ${error.response.statusText}`,
                data: error.response.data,
            });
        } else if (error.request) {
            // El microservicio no respondió
            return res.status(500).json({ message: 'Error de conexión con el microservicio ALMACÉN' });
        } else {
            // Otro tipo de error
            return res.status(500).json({ message: `Error inesperado: ${error.message}` });
        }
    }
};


export const deleteClienteControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, ".....id");
    console.log(`${service_almacen}/almacen/${id}`);
    const response = await axios.delete(`${service_almacen}/almacen/${id}`);
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
