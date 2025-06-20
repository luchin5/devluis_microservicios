import modelAlmacen from "../models/almacen_model.js";

// RESPETAR Y ALICAR LA SIGUIENTE ESTRUCTURA PARA TODOS LOS
// MICROSERVICIOS : GET,GET(id),POST, PUT y DELETE

// RESPETAR LAS RESPUESTAS HTTP (20X, 40X, 50X)

export const getAlmacenController = async (req, res) => {
  try {
    const resultado = await modelAlmacen.getAllAlmacen();

    if (!resultado) {
      return res.status(404).json({ message: "Data not Found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  

export const getAlmacenControllerId = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await modelAlmacen.getAlmacenId(id);

    if (!resultado) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  

export const postAlmacenController = async (req, res) => {
  try {
    const resultado = req.body;
    const response = await modelAlmacen.createAlmacen(resultado);

    if (!response) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  

export const putAlmacenController = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = req.body;
    const response = await modelAlmacen.updateAlmacen(id, resultado);
    if (!response) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
export const deleteAlmacenController = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await modelAlmacen.deleteAlmacen(id);
    if (!resultado) {
      return res.status(404).json({ message: "Not Found" });
    }
    res.status(200).json({message:"Delete succesfully"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};