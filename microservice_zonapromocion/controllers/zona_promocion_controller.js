import modelZonaPromocion from '../models/zona_promocion_model.js'

export const getZonaPromociones = async (req, res) => {
    try {
        const { idzona } = req.params
        const { idprom } = req.params
        const resultado = await modelZonaPromocion.getZonaPromocion(idzona,idprom)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPromosDetalles = async (req, res) => {
    try {
        const { idpromo } = req.params
        const resultado = await modelZonaPromocion.getPromoDetalles(idpromo)
        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getZonaPromocionesDetalles = async (req, res) => {
    try {
        const { idzona } = req.params
        const { idprom } = req.params
        const resultado = await modelZonaPromocion.getPromoDetallesZona(idzona,idprom)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};