import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config()

const service_producto = process.env.MICRO_PRODUCTO;
const service_zonaproducto = process.env.MICRO_ZONAPRODUCTO;
const service_zonapromocion = process.env.MICRO_ZONAPROMOCION;

//PRODUCTO Y PROMOCIONES DE LOS CLIENTES SELECCIONADOS
export const productosPromocionesSeleccionadasControllerGW = async (req, res) => {
    try {
        // Validar que el body sea un array
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ message: "El body debe ser un array de productos y promociones" });
        }

        // Arrays para almacenar productos y promociones por separado
        const productos = [];
        const promociones = [];

        // Procesar cada elemento del array
        for (const item of req.body) {
            // Validar que el item tenga cantidad
            if (!item.cantidad || isNaN(item.cantidad) || item.cantidad <= 0) {
                return res.status(400).json({ message: "Cada item debe tener una cantidad válida" });
            }

            // Procesar producto
            if (item.producto_id) {
                try {
                    // Obtener información del producto
                    const productoResponse = await axios.get(`${service_producto}/producto/${item.producto_id}`);
                    const producto = productoResponse.data;
                    
                    // Obtener información de zona_producto
                    const zonaProductoResponse = await axios.get(`${service_zonaproducto}/precioZonaProducto/${item.producto_id}`);
                    const zonaProducto = zonaProductoResponse.data;

                    // Calcular el porcentaje de descuento
                    const precio = zonaProducto.precio || 0;
                    const descuento = zonaProducto.descuento || 0;
                    const porcentajeDescuento = precio > 0 ? ((descuento / precio) * 100).toFixed(2) : 0;
 

                    // Crear objeto con la información solicitada
                    const productoResultado = {
                        id: item.producto_id,
                        cantidad: item.cantidad,
                        producto: producto,
                        precio: zonaProducto.precio || 0,
                        descuento: zonaProducto.descuento || 0,
                        porcentajeDescuento: parseFloat(porcentajeDescuento)
                    };  
                    
                    // Agregar a la lista de productos
                    productos.push(productoResultado);
                } catch (error) {
                    console.error(`Error al procesar producto_id ${item.producto_id}:`, error.message);
                    continue; // Continuar con el siguiente item en caso de error
                }
            } 
            // Procesar promoción
            else if (item.promocion_id) {
                try {
                    // Obtener información de la promoción
                    const promocionResponse = await axios.get(`${service_producto}/promocion/${item.promocion_id}`);
                    const promocion = promocionResponse.data;
                    
                    // Obtener información de zona_promocion
                    const zonaPromocionResponse = await axios.get(`${service_zonapromocion}/preciopromo/${item.promocion_id}`);
                    const zonaPromocion = zonaPromocionResponse.data;

                    // Calcular el porcentaje de descuento
                    const precio = zonaPromocion.precio || 0;
                    const descuento = zonaPromocion.descuento || 0;
                    const porcentajeDescuento = precio > 0 ? ((descuento / precio) * 100).toFixed(2) : 0;


                    // Crear objeto con la información solicitada
                    const promocionResultado = {
                        id: item.promocion_id,
                        cantidad: item.cantidad,
                        promocion: promocion,
                        precio: zonaPromocion.precio || 0,
                        descuento: zonaPromocion.descuento || 0,
                        porcentajeDescuento: parseFloat(porcentajeDescuento)
                    };
                    
                    // Agregar a la lista de promociones
                    promociones.push(promocionResultado);
                } catch (error) {
                    console.error(`Error al procesar promocion_id ${item.promocion_id}:`, error.message);
                    continue; // Continuar con el siguiente item en caso de error
                }
            } else {
                // Si no tiene producto_id ni promocion_id, ignorar este item
                continue;
            }
        }

        // Devolver resultados agrupados
        res.status(200).json({
            productos: productos,
            promociones: promociones
        });
        
    } catch (error) {
        console.error("Error en productosPromocionesSeleccionadasControllerGW:", error);
        res.status(500).json({ message: "Error al procesar productos y promociones", error: error.toString() });
    }
};


//ENDPOINT QUE TRAE LOS PRODUCTO DE FORMA ALEATORIA LOS PRODUCTOS
export const añadirProductosPromocionesControllerGW = async (req, res) => {
    try {
        // Obtener productos y promociones aleatorios del nuevo endpoint
        const randomResponse = await axios.get(`${service_producto}/productos_promociones`);
        
        // Verificar la respuesta
        if (!randomResponse.data || !randomResponse.data.productos || !randomResponse.data.promociones) {
            return res.status(500).json({ 
                message: "Error al obtener datos de productos y promociones" 
            });
        }
        
        const { productos: productosRandom, promociones: promocionesRandom } = randomResponse.data;
        
        // Arrays para almacenar productos y promociones procesados
        const productos = [];
        const promociones = [];
        
        // Procesar cada producto aleatorio
        for (const producto of productosRandom) {
            try {
                // Obtener información de zona_producto
                const zonaProductoResponse = await axios.get(`${service_zonaproducto}/precioZonaProducto/${producto.id}`);
                const zonaProducto = zonaProductoResponse.data;
                
                // Calcular el porcentaje de descuento
                const precio = zonaProducto.precio || 0;
                const descuento = zonaProducto.descuento || 0;
                const porcentajeDescuento = precio > 0 ? ((descuento / precio) * 100).toFixed(2) : 0;
                
                // Crear objeto con la información solicitada
                const productoResultado = {
                    id: producto.id,
                    cantidad: 1, // Valor por defecto
                    producto: producto,
                    precio: zonaProducto.precio || 0,
                    descuento: zonaProducto.descuento || 0,
                    porcentajeDescuento: parseFloat(porcentajeDescuento)
                };
                
                // Agregar a la lista de productos
                productos.push(productoResultado);
            } catch (error) {
                console.error(`Error al procesar producto_id ${producto.id}:`, error.message);
                continue; // Continuar con el siguiente producto en caso de error
            }
        }
        
        // Procesar cada promoción aleatoria
        for (const promocion of promocionesRandom) {
            try {
                // Obtener información de zona_promocion
                const zonaPromocionResponse = await axios.get(`${service_zonapromocion}/preciopromo/${promocion.id}`);
                const zonaPromocion = zonaPromocionResponse.data;
                
                // Calcular el porcentaje de descuento
                const precio = zonaPromocion.precio || 0;
                const descuento = zonaPromocion.descuento || 0;
                const porcentajeDescuento = precio > 0 ? ((descuento / precio) * 100).toFixed(2) : 0;
                
                // Crear objeto con la información solicitada
                const promocionResultado = {
                    id: promocion.id,
                    cantidad: 1, // Valor por defecto
                    promocion: promocion,
                    precio: zonaPromocion.precio || 0,
                    descuento: zonaPromocion.descuento || 0,
                    porcentajeDescuento: parseFloat(porcentajeDescuento)
                };
                
                // Agregar a la lista de promociones
                promociones.push(promocionResultado);
            } catch (error) {
                console.error(`Error al procesar promocion_id ${promocion.id}:`, error.message);
                continue; // Continuar con el siguiente item en caso de error
            }
        }
        
        // Devolver resultados agrupados
        res.status(200).json({
            productos: productos,
            promociones: promociones
        });
        
    } catch (error) {
        console.error("Error en productosPromocionesRandomControllerGW:", error);
        res.status(500).json({ 
            message: "Error al procesar productos y promociones aleatorios", 
            error: error.toString() 
        });
    }
};
