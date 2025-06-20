import modelPedidoDetalle from "../models/pedido_model.js";

export const getPedidosAlmacenControllerID = async (req,res) =>{
    try {
        const {idalmacen,estado} = req.params
        const id = parseInt(idalmacen,10)
        const resultado = await modelPedidoDetalle.getPedidosAlmacen(id,estado)
        if(!resultado){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(resultado)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

//TABLA PEDIDOS
export const getPedidoController = async (req, res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedido()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getPedidoControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidoId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//ENDPOINT QUE TRAE EL ID DEL PEDIDO CON EL ID DEL CONDCUTOR
export const getPedidoConductorControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidoConductorId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postPedidoController = async (req, res) => {
    try {
        const resultado = req.body
        const response = await modelPedidoDetalle.postPedido(resultado)
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePedidoController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedido(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePedidoController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.deletePedido(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json({ message: "Delete succesfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//CONTROLLERS TABLA DETALLES PEDIDOS
export const getDetallePedidos = async (req, res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedidoDetalle()
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDetallePedidosId = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelPedidoDetalle.getPedidoDetalleId(id);

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const postDetallePedidos = async (req, res) => {
    try {
        const resultado = req.body;
        const response = await modelPedidoDetalle.postPedidoDetalle(resultado);
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoDetallesController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoDetalle(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePedidoDetalleController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelPedidoDetalle.deletePedidoDetalle(id);
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json({ message: "Delete succesfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//CONTROLLER PEDIDOS CON DETALLE PEDIDO
export const getDetallePedidosAll = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelPedidoDetalle.getDetallePedidoAll(id);

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//CONTEO DE PEDIDOS
export const getPedidosConteos = async (req, res) => {
    try {
        
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidosCount(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//ULTIMO PEDIDO REALIZADO POR EL CONDUCTOR
export const getPedidosConductorInfos = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidosConductorInfo(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPedidosSinConductores = async (req, res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedidosSinConductor()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoAlmacenController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoAlmacen(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoPrecios = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoPrecio(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePedidoConductores = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoConductor(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoConductoresEstado = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoConductorEstado(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPedidoHistoryConductores = async (req,res) => {
    try {
        const {id,fecha}= req.params
        const response  = await modelPedidoDetalle.getPedidoHistoryConductor(id,fecha)
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};


export const getPedidoCentralPendientes = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getPedidoCentralPendiente()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getPedidoCentralEnProcesos = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getPedidoCentralEnProceso()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};



export const getPedidoCentralEntregados = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getPedidoCentralEntregado()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};



export const getPedidoTotalesCentral = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getPedidoTotalCentral()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};


export const getPedidosDistribuidor = async (req,res) => {
    try {
        const { id } = req.params
        const response  = await modelPedidoDetalle.getPedidoDistribuidor(id)
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};




export const updatePedidoCancelados = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoCancelado(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoRotacionesManual = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoRotacionManual(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePedidoDistribuidores = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoDistribuidor(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getPedidosPendientesDistribuidor = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getPedidosPendienteDistribuidor()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getPedidosEnProcesoDistribuidores = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getPedidosEnProcesoDistribuidor()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getPedidosEntregadosDistribuidores = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getPedidosEntregadoDistribuidor()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getConteoTotalPedidosDistribuidor = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getConteoTotalPedidoDistribuidor()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getConteoTotalDistribuidoresPedidos = async (req,res) => {
    try {
        const { fecha } = req.params
        const response  = await modelPedidoDetalle.getConteoTotalDistribuidorPedido(fecha)
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getPedidosDistribuidoresResumen = async (req,res) => {
    try {
        const { fecha,id } = req.params
        const response  = await modelPedidoDetalle.getPedidosDistribuidorResumen(fecha,id)
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getVentasDiariasMes = async (req, res) => {
    try {
        const { mesAnio } = req.params;
        const response = await modelPedidoDetalle.getVentasPorDiaMes(mesAnio);
        if (!response || response.length === 0) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getVentasTotalesMes = async (req, res) => {
    try {
        const { mesAnio } = req.params;
        const response = await modelPedidoDetalle.getVentasTotalesMes(mesAnio);
        if (!response || !response.ventas_total) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPrimeraFechaPedido = async (req, res) => {
    try {
        const response = await modelPedidoDetalle.getPrimeraFechaPedido();
        if (!response || (!response.mes_anio && !response.anio_mes)) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPedidoClienteHistorialesId = async (req,res) => {
    try {
        const { id } = req.params
        const response  = await modelPedidoDetalle.getPedidoClienteHistorialId(id)
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getDeliverysTipos = async (req,res) => {
    try {
        const response  = await modelPedidoDetalle.getDeliveryTipo()
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

export const getDeliverysTiposById = async (req,res) => {
    try {
        const {id} = req.params
        const response  = await modelPedidoDetalle.getDeliveryTipoById(id)
        if(!response || response.length === 0){
            return res.status(404).json({message:"Data not found"})
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({error:error.message})
    }
};

//GETCODIGO DESCUENTO
export const verificarCodigoController = async (req, res) => {
    try {
        const { codigo } = req.query;
        if (!codigo) {
            return res.status(400).json({ message: "Parámetro 'codigo' es requerido" });
        }
        const resultado = await modelPedidoDetalle.getCodigoVerificacion(codigo);

        if (!resultado) {
            return res.status(404).json({ message: "Código no válido" });
        }

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//GET CODIGO DE DESCUENTO
export const getCodigoDescuentoController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelPedidoDetalle.getCodigoDescuento(id);

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


