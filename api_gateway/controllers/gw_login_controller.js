// gw_login_controller.js
import axios from "axios";
import dotenv from "dotenv";

// Carga las variables de entorno del archivo .env
dotenv.config();

const service_auth = process.env.MICRO_AUTH;
const service_cliente = process.env.MICRO_CLIENTE;
const service_conductor = process.env.MICRO_CONDUCTOR;
console.log(service_auth);


//nuevo ramaLucho
export const putPhoneFirebaseGW = async (req,res) =>{
  try {
    const {firebaseUID} = req.params
    const datos = req.body
    console.log("........DATOS FONO")
    console.log(datos)
    console.log(firebaseUID)
    const response = await axios.put(`${service_auth}/userfirebase_phone/${firebaseUID}`,
      datos
    )
    console.log("respuesta....phon")
      console.log(response)
    if(!response || response.data == null){
      console.log("respuesta....phon")
      console.log(response)
      return res.status(400).json({message:response.data})
    }
    return res.status(200).json(response.data)

  } catch (error) {
    res.status(500).json({error:error.message})
  }
}


//nuevoAdd commentMore actions
export const getUserFirebaseGW = async (req, res) => {
  console.log("....FIREBASE NUEVO");
  try {
    const { firebaseUID } = req.params;

    // Hacemos la llamada al servicio de auth
    let authResponse;
    try {
      authResponse = await axios.get(`${service_auth}/userfirebase/${firebaseUID}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Usuario no encontrado en auth
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      throw err; // Otro error más grave
    }

    const userData = authResponse.data;
    const id = userData.id;

    // Ahora vamos al servicio cliente
    let clienteResponse;
    try {
      clienteResponse = await axios.get(`${service_cliente}/cliente_user/${id}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      throw err;
    }

    const clienteCompleto = {
      user: userData,
      cliente: clienteResponse.data,
    };

    res.status(200).json(clienteCompleto);
  } catch (error) {
    console.error("❌ Error en getUserFirebaseGW:", error.message);
    res.status(500).json({ error: "Error al recuperar cliente completo" });
  }
};

// ENDPOINT CORREGIDO
export const postNewUserCLienteControllerGW = async (req, res) => {
  try {
    console.log(`${req.body} ......AQUIESTOY`);
    const newUserCredencial = req.body;
    console.log(`${newUserCredencial.user.rol_id} ......AQUIESTOY`);
    const response = await axios.post(
      `${service_auth}/user_new`,

      newUserCredencial.user
    );
    if (response.data.message === "User exist!") {
      return res.status(400).json({ message: 'Data not found' });
    }

    const usuarioId = response.data.id;

    const responseCliente = await axios.post(
      `${service_cliente}/cliente`,
      {
        usuario_id: usuarioId,
        ...newUserCredencial.cliente,
      }
    );
    if(responseCliente.data.message === 'Invalid input data'){
      return res.status(400).json({message:'Data not found'})
    }
    res.status(201).json({user:response.data,cliente:responseCliente.data})
  } catch (error) {
    res.status(500).json({error:error.message})
  }
};

export const postNewUserConductorControllerGW = async (req, res) => {
  try {
    const newUserCredencial = req.body;
    const response = await axios.post(
      `${service_auth}/user_new`,

      newUserCredencial.user
    );
    if (response.data.message === "User exist!") {
      return res.status(400).json({ message: response.data.message });
    }

    const usuarioId = response.data.id;

    const responseConductor = await axios.post(
      `${service_conductor}/conductor`,
      {
        usuario_id: usuarioId,
        ...newUserCredencial.conductor,
      }
    );
    if(responseConductor.data.message === 'Invalid input data'){
      return res.status(400).json({message:responseConductor.data.message})
    }
    res.status(201).json({user:response.data,conductor:responseConductor.data})
  } catch (error) {
    res.status(500).json({error:error.message})
  }
};
//ENDPOINT PARA EL REGISTRO MANUAL
export const putOrPostUserClienteControllerGW = async (req, res) => {
  try {
    const newUserCredencial = req.body;

    // PRIMERO: Se actualiza o inserta el usuario (PUT)
    const userResponse = await axios.put(
      `${service_auth}/user_micro`,
      newUserCredencial.user
    );
    const usuarioId = userResponse.data.id;

    // LUEGO: Se actualiza o inserta el cliente (PUT)
    const clienteResponse = await axios.put(
      `${service_cliente}/cliente_micro`,
      {
        usuario_id: usuarioId,
        ...newUserCredencial.cliente
      }
    );

    // TODO OK
    res.status(200).json({
      message: "Usuario y cliente registrados o actualizados exitosamente",
      user: userResponse.data,
      cliente: clienteResponse.data
    });

  } catch (error) {
    console.error("Gateway error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error || error.message,
      details: error.response?.data?.details || error.response?.data || "Unknown error"
    });
  }
};



export const postLoginController = async (req, res) => {
  try {
    const credenciales = req.body;
    const response = await axios.post(`${service_auth}/login`, credenciales);
    console.log("response----------", response.data);
    if (response && response.data.tokenUser) {
      // CONDUCTOR
      if (response.data.existsUser.rol_id == 5) {
        console.log("cond");
        const id_user = response.data.existsUser.id;
        const res_cond = await axios.get(
          `${service_conductor}/conductor_user/${id_user}`
        );
        console.log("conductor");
        console.log(res_cond.data);
        if (res_cond.status == 200) {
          res.status(201).json({
            driver: res_cond.data,
            user: response.data.existsUser,
            token: response.data.tokenUser,
          });
        } else {
          res.status(404).json({ message: "Not found" });
        }
      }
      // CLIENTE
      else if (response.data.existsUser.rol_id == 4) {
        console.log("cliente");
        const id_user = response.data.existsUser.id;
        const res_client = await axios.get(
          `${service_cliente}/cliente_user/${id_user}`
        );
        if (res_client.status == 200) {
          res.status(201).json({
            client: res_client.data,
            user: response.data.existsUser,
            token: response.data.tokenUser,
          });
        } else {
          res.status(404).json({ message: "Not found" });
        }
      }
      //CENTRAL
      else if (response.data.existsUser.rol_id == 3) {
        console.log("CENTRAL");
        res.status(201).json({
          user: response.data.existsUser,
          token: response.data.tokenUser
        });
      }
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error fetching auth");
  }
};



export const postUserExistController = async (req, res) => {
  try {
    console.log("........dentro del exist user GW");
    const credenciales = req.body;
    const response = await axios.post(`${service_auth}/user`, credenciales);
    const userExist = response.data;
    if (userExist.message == "User exist!") {
      res.status(201).json({ message: response.data.message });
    } else if (userExist.message == "User new") {
      res.status(201).json({ message: response.data.message });
    }
  } catch (error) {
    res.status(500).send("Error fetching clients");
  }
};


export const postUserClienteControllerGW = async (req, res) => {
  try {
    const newUserCredencial = req.body;


    const userResponse = await axios.post(
      `${service_auth}/register_user`,
      newUserCredencial.user
    );
    const usuarioId = userResponse.data.id;

    const clienteResponse = await axios.post(
      `${service_cliente}/register_cliente`,
      {
        usuario_id: usuarioId,
        ...newUserCredencial.cliente
      }
    );

    res.status(201).json({
      message: "Usuario y cliente registrados exitosamente",
      user: userResponse.data,
      cliente: clienteResponse.data
    });

  } catch (error) {
    console.error("Gateway error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error || error.message,
      details: error.response?.data?.details || error.response?.data || "Unknown error"
    });
  }
};
