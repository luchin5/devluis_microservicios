import modelCodigo from "../models/codigo_model.js"

export const getCodigoController = async (req, res) => {
    try {
        const resultado = await modelCodigo.getCodigo()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const getCodigosTipoController = async (req, res) => {
    try {
        const resultado = await modelCodigo.getCodigoTipo()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};


export const getCuponPedidoController = async (req, res) => {
    try {
        const {id} = req.params
        const resultado = await modelCodigo.getCuponCliente(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};