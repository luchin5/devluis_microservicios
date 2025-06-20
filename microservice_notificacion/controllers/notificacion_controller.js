import modelNotificaciones from "../models/notificacion_model.js";
export const getAllNotificacionesAlmacenes = async (req, res) => {
    try {
        const {fecha,id} = req.params
        const resultado = await modelNotificaciones.getAllNotificacionesAlmacen(id,fecha)

        if (!resultado || resultado.length===0) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
}

export const createNotificacionesAlmacenes = async (req, res) => {
    try {
        const data = req.body
        const resultado = await modelNotificaciones.createNotificaciones(data)

        if (!resultado) {
            return res.status(404).json({ message: "Input invalid data" });
          }
          res.status(200).json(resultado);
        }
    catch (error) {
          res.status(500).json({ error: error.message });
    }
}

export const getAllNotificacionesClientes = async (req, res) => {
    try {
        const {fecha} = req.params
        const resultado = await modelNotificaciones.getAllNotificacionesCliente(fecha)

        if (!resultado || resultado.length===0) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
}

export const createNotificacionesClientes = async (req, res) => {
    try {
        const data = req.body
        const resultado = await modelNotificaciones.createNotificacionesCliente(data)

        if (!resultado) {
            return res.status(404).json({ message: "Input invalid data" });
          }
          res.status(200).json(resultado);
        }
    catch (error) {
          res.status(500).json({ error: error.message });
    }
}
