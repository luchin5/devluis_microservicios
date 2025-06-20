import modelUserConductor from "../models/conductor_model.js"
export const getAllUsersConductores = async (req, res) => {
    try {
        const resultado = await modelUserConductor.getAllUsersConductor()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
}

export const getConductorControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUserConductor.getConductorUserId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
}

export const getConductorController_Id = async (req, res) => {
  try {
      const { id } = req.params
      const resultado = await modelUserConductor.getConductorUser_Id(id)

      if (!resultado) {
          return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

export const createUserConductores = async (req, res) => {
    try {
        const resultado = req.body
        const response = await modelUserConductor.createUserConductor(resultado)

        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
          }
          res.status(201).json(response);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const updateUserConductores = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelUserConductor.updateUserConductor(id, resultado);
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
          }
          res.status(200).json(response);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const updateEventosConductores = async (req, res) => {
  try {
      const { id } = req.params
      const resultado = req.body
      const response = await modelUserConductor.updateEventosConductor(id, resultado);
      if (!response) {
          return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};

export const deleteUserConductores = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUserConductor.deleteUserConductor(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
          }
          res.status(200).json({message:"Delete succesfully"});
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const getAllEventos = async (req, res) => {
  try {
      const resultado = await modelUserConductor.getEventoConductor()

      if (!resultado) {
          return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};

export const getEventoConductoresPorId = async (req, res) => {
  try {
      const {id} = req.params
      const resultado = await modelUserConductor.getEventoConductorPorId(id)

      if (!resultado) {
          return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};

export const getEventoConductorEspecificos = async (req,res) => {
  try{
    const {id} = req.params
    const resultado = await modelUserConductor.getEventoConductorEspecifico(id)
    if (!resultado){
      return res.status(404).json({message: "Data not found"})
    }
    res.status(200).json(resultado);
  } catch(error){
    res.status(500).json({error: error.message });
  }
};

export const getDistribuidoresAlmacen = async (req,res) => {
  try{
    const {id} = req.params
    const resultado = await modelUserConductor.getDistribuidorAlmacen(id)
    if (!resultado){
      return res.status(404).json({message: "Data not found"})
    }
    res.status(200).json(resultado);
  } catch(error){
    res.status(500).json({error: error.message });
  }
};