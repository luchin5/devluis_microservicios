import modelProducto from '../models/producto_model.js'

export const getProductoController = async (req, res) => {
    try {
        const resultado = await modelProducto.getProducto()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getProductoControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelProducto.getProductoId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPromocionController = async (req, res) => {
    try {
        const resultado = await modelProducto.getPromocion()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPromocionControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelProducto.getPromocionId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getCantidadPromoProductos = async (req, res) => {
    try {
        const { idprom } = req.params
        const { idprod } = req.params
        const resultado = await modelProducto.getCantidadPromoProducto(idprom,idprod)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//ACTUALIZACION DE LA VALORACION DE LOS PRODUCTOS
export const actualizarValoracionProducto = async (req,res) => {
    try{
        const {id} = req.params;
        const resultado = req.body;
        const response = await modelProducto.actualizarCalificacionProducto(id,resultado);
        if (!response){
            return res.status(404).json({ message : "Not Found"});
        }
        res.status(200).json(response);
    }catch(error){
        res.status(500).json({error:error.message});
    }
};

//ACTUALIZACION DE LA VALORACION DE LAS PROMOCIONES
export const actualizarValoracionPromocion = async (req,res) => {
    try{
        const {id} = req.params;
        const resultado = req.body;
        const response = await modelProducto.actualizarCalificacionPromocion(id,resultado);
        if (!response){
            return res.status(404).json({ message : "Not Found"});
        }
        res.status(200).json(response);
    }catch(error){
        res.status(500).json({error:error.message});
    }
};

//CONTROLLER PRODUCTOS PARA LA SECCION DE SUGERENCIAS
export const getProductosYPromocionesController = async (req, res) => {
    try {
        const resultado = await modelProducto.getProductosYPromocionesModel()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//GET CODIGO DE PRODUCTO ID
export const getProductoIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelProducto.getProductoIdByPromocion(id);

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};