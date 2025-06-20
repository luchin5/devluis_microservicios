import modelUbicacion from "../models/ubicacion_model.js"
//TABLA DE UBICACIONES
export const getAllUbicaciones = async (req, res) => {
    try {
        const resultado = await modelUbicacion.getUbicacion();
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getUbicacionesId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.getUbicacionId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createUbicacion = async (req, res) => {
    try {
        const resultado = req.body;
        const response = await modelUbicacion.createUbicacion(resultado);
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updateRelacionesUbicaciones = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = req.body;
        const response = await modelUbicacion.updateRelacionesUbicacion(id, resultado);
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUbicaciones = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.deleteRelacionesUbicacion(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json({ message: "Delete succesfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//TABLA ZONA TRABAJO
export const getZonas = async (req, res) => {
    try {
        const resultado = await modelUbicacion.getZona();
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getZonasId = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelUbicacion.getZonaId(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createZonas = async (req, res) => {
    try {
        const resultado = req.body;
        const response = await modelUbicacion.createZona(resultado);
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateZonas = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = req.body;
        const response = await modelUbicacion.updateZona(id, resultado);
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteZonas = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.deleteZona(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
          }
          res.status(200).json({message:"Delete succesfully"});
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };

      //POST DE CLIENTES PARA NUESTRA APLICACIÓN DEL LADO CLIENTE
      export const createUbicacionesCliente = async (req, res) => {
        try {
            //ENVIAMOS EL BODY NECESARIO PARA EL POST DE CLIENTE
            const resultado = req.body;
            //AQUI TRAEMOS EL MODEL QUE CREAMOS Y MANEJAMOS LAS RESPUESTAS
            const response = await modelUbicacion.createUbicacionCliente(resultado);
            if (!response) {
                return res.status(400).json({ message: "Invalid input data" });
            }
            res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    //TRAER LA UBICACION DE UN CLIENTE
    export const getUltimaUbicacionesCliente = async (req,res) => {
        try {
            const { id } = req.params
            const resultado = await modelUbicacion.ultimaUbicacionCliente(id)
            if (!resultado) {
                return res.status(404).json({ message: "Data not found" });
            }
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //ACTUALIZACION DE LA ULTIMA DIRECCION DEL USUARIO
    export const actualizarUltimaUbicacionCliente = async (req,res) => {
        try {
            const { id } = req.params;
            const resultado = req.body;
            const response = await modelUbicacion.actualizarUbicacionCliente(id, resultado);
            if (!response) {
                return res.status(404).json({ message: "Not Found" });
            }
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //TODAS LAS DIRECCIONES DEL CLIENTE REGISTRADAS

    export const AllUbicacionCliente = async (req,res) => {
        try {
            const { cliente } = req.params
            const resultado = await modelUbicacion.getDireccionesCliente(cliente)
            if (!resultado || resultado.length === 0) {
                return res.status(404).json({ message: "Data not found" });
            }
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    //TODAS LAS DEPARTAMENTOS DISPONIBLES

    export const getDepartamentosCliente = async (req,res) => {
        try {
            const resultado = await modelUbicacion.getDepartamentoCliente()
            if (!resultado) {
                return res.status(404).json({ message: "Data not found" });
            }
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    //TODAS LOS DISTRITOS DE UN DEPARTAMENTO EN ESPECIFICO
    export const getDistritosClienteController = async (req,res) => {
        try {
            const {id} = req.params;
            const resultado = await modelUbicacion.getDistritosCliente(id)
            if (!resultado || resultado.length == 0) {
                return res.status(404).json({ message: "Data not found" });
            }
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

