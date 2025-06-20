import modelZonaProducto from '../models/zona_producto_model.js'

export const getCantidadPromoProductos = async (req, res) => {
    try {
        const { idzona } = req.params
        const { idprod } = req.params
        const resultado = await modelZonaProducto.getCantidadPromoProducto(idzona,idprod)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPromoProductosDetalles = async (req, res) => {
    try {
        const { idprod } = req.params
        const resultado = await modelZonaProducto.getPromoProductoDetalles(idprod)
        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getProductoZonaDetalles = async (req, res) => {
    try {
        const { idzona } = req.params
        const { idprod } = req.params
        const resultado = await modelZonaProducto.getProductoZonaDetalle(idzona,idprod)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};