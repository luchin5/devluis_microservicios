import modelNovedad from "../models/novedades_model.js"

export const getNovedadController = async (req, res) => {
    try {
        const resultado = await modelNovedad.getNovedad()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};