import modelCategoria from "../models/categoria_model.js"
export const getAllCategorias = async (req, res) => {
    try {
        const resultado = await modelCategoria.getAllCategoria();
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllCategoriasPorID = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelCategoria.getAllCategoriaPorID(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getAllProductosSubcategorias = async (req, res) => {
    try {
        const { subcategoriaId } = req.params
        const resultado = await modelCategoria.getAllProductosSubcategoria(subcategoriaId);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getAllSubCategoriasPorID = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelCategoria.getSubcategoriaById(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllSubCategoriasNombrePorID = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelCategoria.getSubcategoriaByIdNombre(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCategoriasPorUbicaciones = async (req, res) => {
    try {
        const resultado = await modelCategoria.getCategoriasPorUbicacion();
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCategoriasSubcategoriasPorID = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelCategoria.getCategoriaAllSubcategoriasPorID(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};