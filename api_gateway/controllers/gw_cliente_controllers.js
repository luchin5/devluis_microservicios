import axios from 'axios';
//import redisClient from '../index.js';
import amqp from 'amqplib';
import dotenv from 'dotenv'
dotenv.config()


const service_cliente = process.env.MICRO_CLIENTE
const service_producto = process.env.MICRO_PRODUCTO
const service_auth = process.env.MICRO_AUTH;

console.log(service_cliente)

export const getClientesControllerGW = async (req, res) => {
 //   const cacheKey = 'clientes_cache'

    // REDIS    
    /*
    let cacheData;
    try {
        cacheData = await redisClient.get(cacheKey)
        console.log("Dato de caché", cacheData)
    } catch (redisError) {
        console.error("Error al obtener datos de Redis:", redisError.message)
    }*/

    //VERIFICAR DATA CACHE
    //if (cacheData) {
    //    return res.status(200).json(JSON.parse(cacheData))
    //}



    try {
        const response = await axios.get(`${service_cliente}/cliente`);
        if (response && response.data) {
            /*
            try {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:", redisSetError.message)
            }*/
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ message: 'Not Found' });
        }
    } catch (error) {
        res.status(500).send('Error fetching clients');
    }
};

export const getClientesControllerIdGW = async (req,res) => {
    
    // REDIS
    /*const cacheKey = `cliente_id_cache`; // Clave específica por ID
    let cacheData; 
    
    try {
        cacheData = await redisClient.get(cacheKey)
        console.log("Dato de caché:",cacheData)
    } catch (redisError) {
        console.error("Error al obtener datos de Redis:",redisError.message)
    }

    if(cacheData){
        return res.status(200).json(JSON.parse(cacheData))
    }
*/
    // AXIOS - BD
    try {
        const { id } = req.params
        console.log(id,".....id")
       // console.log(`${service_cliente}/cliente/${id}`)
        const response = await axios.get(`${service_cliente}/cliente/${id}`)
        console.log(response.data,"---------------client id")
        if(response && response.data){
/*
            try {
                await redisClient.setEx(cacheKey,3600,JSON.stringify(response.data))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:",redisSetError.message)
            }*/
          //  await sendToQueue('clientes_queue', response.data);
            res.status(200).json(response.data);
        }else{
            res.status(404).json({ message: 'Not found '})
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }

}

export const postClienteControllerGW = async (req,res) => {
    try {
        const response = req.body
        console.log(response,"<--------------data POST api gw")

        const resultado = await axios.post(`${service_cliente}/cliente`,response)
        console.log(resultado,"<------------micro cliente API GW")
        if(resultado && resultado.data){
            res.status(201).json(resultado.data)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
        
    } catch (error) {
        console.log("----ERROR API GW")
        res.status(500).json({error:error.message})
    }
}


export const putClienteControllerGW = async (req,res) => {
    try {
        const {id}= req.params
        console.log(id,"....id")
        console.log(`${service_cliente}/cliente/${id}`)
        const response = await axios.put(`${service_cliente}/cliente/${id}`,req.body)
        console.log(response.data,"<--------------data POST api gw")
        if(response){
            res.status(200).json(resultado.data)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
        
    } catch (error) {
        res.status(500).send('Error Modificar Cliente')
    }
}

export const putClienteCalificationControllerGw = async (req,res) =>{
    try {
        console.log("...hola")
        const {id} = req.params
        const body = req.body
        console.log(id)
        console.log(body)
        const response = await axios.put(`${service_cliente}/cliente_calificacion/${id}`,body)
        console.log(".....PUT...")
        console.log(response.data)
        if(response){
            res.status(200).json(response.data)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
    } catch (error) {
        res.status(500).send('Error Calificar Cliente')
    }
}

export const deleteClienteControllerGW = async (req, res) => {
    try {
        const { id }= req.params
        console.log(id,".....id")
        console.log(`${service_cliente}/cliente/${id}`)
        const response = await axios.delete(`${service_cliente}/cliente/${id}`);
        console.log(response.data,"---------conductores id")
        if (response) {
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ message: 'Invalid input data' });
        }
    } catch (error) {
        res.status(500).send('Error creating order');
    }
};

//CONTROLLER QUE ME PERMITE INGRESAR UNA VALORACION
export const postValoracionControllerGW = async (req, res) => {
    try {
      const data = req.body;
  
      // 1. Insertar la nueva valoración
      const resultado = await axios.post(`${service_cliente}/calificacion`, data);
  
      if (!resultado.data) {
        return res.status(400).json({ message: 'La respuesta del servicio no contiene datos válidos' });
      }
  
      let promedio = null;
  
      // 2. Consultar promedio dependiendo del tipo
      if (resultado.data.producto_id) {
        const resProm = await axios.get(`${service_cliente}/calificacion_promedio_producto/${resultado.data.producto_id}`);
        promedio = resProm.data.promedio_calificacion !== null 
        ? parseFloat(resProm.data.promedio_calificacion) 
        : null;
        await axios.put(`${service_producto}/actualizar_valoracion_producto/${resultado.data.producto_id}`,{ valoracion: promedio })

    } else if (resultado.data.promocion_id) {
        const resProm = await axios.get(`${service_cliente}/calificacion_promedio_promocion/${resultado.data.promocion_id}`);
        promedio = resProm.data.promedio_calificacion !== null 
        ? parseFloat(resProm.data.promedio_calificacion) 
        : null;
        await axios.put(`${service_producto}/actualizar_valoracion_promocion/${resultado.data.promocion_id}`,{ valoracion: promedio } )    
    }
  
      // 3. Retornar valoración y promedio
      res.status(201).json({
        ...resultado.data,
        promedio: promedio
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const getPerfilCliente = async (req,res) => {
    try {
        const { id } = req.params
        const responseCliente = await axios.get(`${service_cliente}/cliente/${id}`);
        const clienteData = responseCliente.data;
        const usuarioId = clienteData.usuario_id;
        if (!usuarioId) {
            return res.status(400).json({ message: 'usuario_id no encontrado en los datos del cliente' });
        }
        const responseUsuario = await axios.get(`${service_auth}/user_info_perfil/${usuarioId}`);
        const usuarioData = responseUsuario.data;
        const perfilCompleto = {
            cliente: clienteData,
            usuario: usuarioData
         };
         res.status(200).json(perfilCompleto);

    } catch (error) {
        res.status(500).json({error:error.message})
    }

};


//POST DE SOPORTE TECNICO CLIENTE

export const postSoporteControllerGW = async (req,res) => {
    try {
        const response = req.body
        const resultado = await axios.post(`${service_cliente}/soporte_tecnico`,response)
        console.log(resultado,"<------------micro cliente API GW")
        if(resultado && resultado.data){
            res.status(201).json(resultado.data)
        }
        else{
            res.status(404).json({message:'Invalid input data'})
        }
        
    } catch (error) {
        console.log("----ERROR API GW")
        res.status(500).json({error:error.message})
    }
}


//POST DE LIBRO DE RECLAMACIONES

export const postLibroReclamacionesGW = async (req,res) => {
    try {
        const response = req.body
        const resultado = await axios.post(`${service_cliente}/libro_reclamaciones`,response)
        if(resultado && resultado.data){
            res.status(201).json(resultado.data)
        }
        else{
            res.status(404).json({message:'Invalid input data'})
        }
        
    } catch (error) {
        console.log("----ERROR API GW")
        res.status(500).json({error:error.message})
    }
}

//ACTUALIZAR LA INFORMACION DEL CLIENTE
export const actualizarPerfilClienteControllerGW = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        // Extraer los datos relevantes para cada microservicio
        const datosCliente = {
            nombres: body.nombres,
            apellidos: body.apellidos
            };

        const datosUsuario = {
            telefono: body.telefono,
            email: body.email
        };

        // 1. Actualizamos al cliente
        const response = await axios.put(`${service_cliente}/actualizar_cliente/${id}`, datosCliente);

        if (response.status === 200) {
            const usuario_id = response.data.usuario_id;

            // 2. Actualizamos el perfil del usuario
            const usuarioResponse = await axios.put(`${service_auth}/actualizar_perfil_usuario/${usuario_id}`, datosUsuario);

            if (usuarioResponse.status === 200) {
                res.status(200).json({
                    message: 'Perfil cliente y usuario actualizados correctamente',
                    cliente: response.data,
                    usuario: usuarioResponse.data
                });
            } else {
                res.status(400).json({ message: 'Error al actualizar perfil de usuario' });
            }

        } else {
            res.status(400).json({ message: 'Error al actualizar perfil de cliente' });
        }

    } catch (error) {
        console.error('Error en actualizarPerfilClienteControllerGW:', error.message);
        res.status(500).send('Error al modificar cliente o usuario');
    }
};

export const getLibroReclamaciones = async (req,res) => {
    try {
        const responseCliente = await axios.get(`${service_cliente}/libro_reclamaciones`);
        const clienteData = responseCliente.data;
         res.status(200).json(clienteData);

    } catch (error) {
        res.status(500).json({error:error.message})
    }

};


export const getSoporteTecnico = async (req,res) => {
    try {
        const responseCliente = await axios.get(`${service_cliente}/soporte_tecnico`);
        const clienteData = responseCliente.data;
         res.status(200).json(clienteData);

    } catch (error) {
        res.status(500).json({error:error.message})
    }

};