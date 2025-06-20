import modelCliente from "../models/cliente_model.js"

export const getClienteController = async (req, res) => {
  try {
    const resultado = await modelCliente.getCliente()

    if (!resultado) {
      return res.status(404).json({ message: "Data not Found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getClienteControllerId = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getClienteUserId(id)

    if (!resultado) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getClienteController_Id = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getClienteUser_Id(id)

    if (!resultado) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuariosTotalesMes = async (req, res) => {
  try {
    const { mesAnio } = req.params;
    const response = await modelCliente.getUsuariosTotalesMes(mesAnio);
    if (!response || !response.total_usuarios) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuariosPorDiaMes = async (req, res) => {
  try {
    const { mesAnio } = req.params;
    const response = await modelCliente.getUsuariosPorDiaMes(mesAnio);
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postClienteController = async (req, res) => {
  try {
    const resultado = req.body
    const response = await modelCliente.postCliente(resultado)

    if (!response) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const putMicroClienteController = async (req, res) => {
  try {
    const cliente = req.body;
    const resultado = await modelCliente.upsertMicroCliente(cliente);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const putClienteController = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = req.body
    const response = await modelCliente.putCliente(id, resultado);
    if (!response) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const putClienteCalificationController = async (req, res) => {
  try {
    const { id } = req.params
    const newCalificacion = req.body
    const resultado = await modelCliente.updateCalficationCliente(id, newCalificacion)

    if (!resultado) {
      return res.status(404).json({ message: "Not found" })
    }
    res.status(200).json(resultado)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteClienteController = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.deleteCliente(id)
    if (!resultado) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json({ message: "Delete succesfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postMicroValoracionController = async (req, res) => {
  try {
    const resultado = req.body
    const response = await modelCliente.postValoracionCliente(resultado)

    if (!response) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConteoValoracionesProductoControllerId = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getValoracionProductoId(id)

    if (!resultado) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConteoValoracionesPromocionControllerId = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getValoracionPromocionId(id)

    if (!resultado) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//CONTROLLER QUE ME SIRVE PARA PODER REALIZAR EL PROMEDIO DE LA CALIFICACION DE UN PRODUCTO
export const getPromedioValoracionesProductoId = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getPromedioValoracionProductoId(id)

    if (!resultado) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//CONTROLLER QUE ME SIRVE PARA PODER REALIZAR EL PROMEDIO DE LA CALIFICACION DE UNA PROMOCION
export const getPromedioValoracionesPromocionId = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getPromedioValoracionPromocionId(id)

    if (!resultado) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//CONTROLLER PARA TRAER LAS SENTENCIAS QUE ME TRAE LAS ULTIMAS VALORACIONES DEL CLIENTE
export const getValoracionesClientesLast = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getValoracionesClienteLast(id)
    if (!resultado) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//CONTROLLER PARA TRAER LAS SENTENCIAS QUE ME TRAE LAS ULTIMAS VALORACIONES DEL CLIENTE DE LA PROMOCION
export const getValoracionesClientesPromoLast = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = await modelCliente.getValoracionesClientePromoLast(id)
    if (!resultado) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//CONTROLLER PARA POSTEAR EL SOPORTE TECNICO
export const postSoporteTecnicoController = async (req, res) => {
  try {
    const resultado = req.body
    const response = await modelCliente.postSoporteCliente(resultado)

    if (!response) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//CONTROLLER PARA POSTEAR EL LIBRO DE RECLAMACIONES
export const postLibroReclamacionesController = async (req, res) => {
  try {
    const resultado = req.body
    const response = await modelCliente.postLibroReclamacion(resultado)

    if (!response) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//CONTROLLER PARA ACTUALIZAR LOS DATOS DEL CLIENTE
export const actualizarPerfilCliente = async (req, res) => {
  try {
    const { id } = req.params
    const resultado = req.body
    const response = await modelCliente.actualizarPerfil(id, resultado);
    if (!response) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/*
export const postMicroClienteController = async (req, res) => {
  try {
    const cliente = req.body;
    const resultado = await modelCliente.createMicroCliente(cliente);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}*/

export const postMicroClienteController = async (req, res) => {//Add commentMore actions
  try {
    console.log("..........estoy aqui cliente modificando 2")
      const resultado = req.body
      const response = await modelCliente.postMicroCliente(resultado)

      if (!response) {
          return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};

export const getLibroReclamaciones = async (req, res) => {
  try {
    const resultado = await modelCliente.getLibroReclamaciones()

    if (!resultado) {
      return res.status(404).json({ message: "Data not Found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getSoporteTecnico = async (req, res) => {
  try {
    const resultado = await modelCliente.getSoporteTecnico()

    if (!resultado) {
      return res.status(404).json({ message: "Data not Found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};