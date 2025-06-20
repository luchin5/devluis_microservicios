import axios from 'axios';
import * as turf from '@turf/turf';
import amqp from 'amqplib';
import dotenv from 'dotenv'

dotenv.config()

const RABBITMQ_URL = process.env.RABBITMQ_URL
console.log("rabbit",RABBITMQ_URL)

const QUEUE_NAME = 'colaPedidoRabbit'; // Nombre de la cola

const service_ubicacion = process.env.MICRO_UBICACION
const service_producto = process.env.MICRO_PRODUCTO
const service_zonaproducto = process.env.MICRO_ZONAPRODUCTO
const service_zonapromocion = process.env.MICRO_ZONAPROMOCION
const service_pedido = process.env.MICRO_PEDIDO
const service_almacen = process.env.MICRO_ALMACEN

const sendToQueue = async (pedido) => {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
  
      const msg = JSON.stringify(pedido); // Convertir el pedido a JSON
  
      // Asegurarse de que la cola exista
      await channel.assertQueue(QUEUE_NAME, {
        durable: true, // La cola será persistente
      });
  
      // Enviar el mensaje a la cola
      channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), {
        persistent: true, // El mensaje será persistente
      });
  
      console.log('Pedido enviado a la cola:', pedido);
      
      // Cerramos la conexión
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Error al enviar el pedido a la cola de RabbitMQ:', error.message);
    }
  };

  export const postInfoPedido = async (req, res) => {
    try {
        const {
            cliente_id, subtotal, descuento, total, fecha,
            tipo, estado, observacion, tipo_pago, ubicacion_id,
            detalles
        } = req.body;

        let latitud, longitud;
        try {
            const ubicacionRes = await axios.get(`${service_ubicacion}/ubicacion/${ubicacion_id}`);
            latitud = ubicacionRes.data.latitud;
            longitud = ubicacionRes.data.longitud;

            if (!latitud || !longitud) {
                return res.status(400).json({ message: 'Coordenadas no disponibles' });
            }
        } catch (error) {
            return res.status(404).json({ message: 'Ubicación no encontrada' });
        }

        const [responseZona, responseAlmacen, resultado] = await Promise.all([
            axios.get(`${service_ubicacion}/zona`),
            axios.get(`${service_almacen}/almacen`),
            axios.post(`${service_pedido}/pedido`, {
                cliente_id, subtotal, descuento, total, fecha,
                tipo, estado, observacion, tipo_pago, ubicacion_id
            })
        ]);

        const warehouseRegions = processWarehouseRegions(responseZona.data);
        const warehouses = processWarehouses(responseAlmacen.data);
        const coordinates = [Number(longitud), Number(latitud)];
        const analysis = analyzeLocation(warehouseRegions, coordinates, warehouses);

        if (!resultado.data) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        const pedidoId = resultado.data.id;
        const regionId = analysis.region.warehouseId;
        const almacenId = analysis.nearestWarehouse.id;

        // Process each order detail
        const detallesProcessed = await Promise.all(detalles.map(async (detalle) => {
            const { producto_id, cantidad, promocion_id } = detalle;

            // Fetch product and promotion info in parallel
            const [productoInfo, promocionInfo, cantidadPromos] = await Promise.all([
                axios.get(`${service_producto}/producto/${producto_id}`),
                promocion_id ? axios.get(`${service_producto}/promocion/${promocion_id}`) : Promise.resolve(null),
                promocion_id ? axios.get(`${service_producto}/cantidadprod/${promocion_id}/${producto_id}`) : Promise.resolve(null),
            ]);

            // Calculate price based on promotion
            const precio = await axios.get(
                promocion_id
                    ? `${service_zonaproducto}/precioZonaProducto/${regionId}/${promocion_id}`
                    : `${service_zonapromocion}/preciopromo/${regionId}/${producto_id}`
            );

            const precioFinal = precio.data.precio;
            const descuento_inicial = precio.data.descuento;
            const precioTotalAPagar = precioFinal - descuento_inicial;
            const pagoFinalARealizar = precioTotalAPagar * cantidad;
            const cantidadProductosPorPromo = cantidadPromos?.data?.cantidad;
            const cantidadProductos = cantidadProductosPorPromo*cantidad;

            // Create detail record
            await axios.post(`${service_pedido}/det_pedido`, {
                pedido_id: pedidoId,
                producto_id,
                cantidad,
                promocion_id
            });

            // Return structured data based on whether it's a promotion or regular product
            if (promocion_id) {
                return {
                    id: promocion_id,
                    nombre: promocionInfo.data.nombre,
                    descripcion: promocionInfo.data.descripcion,
                    foto: promocionInfo.data.foto,
                    valoracion: promocionInfo.data.valoracion,
                    categoria: promocionInfo.data.categoria,
                    precio: precioFinal,
                    descuento: descuento_inicial,
                    total: precioTotalAPagar,
                    cantidad: cantidad,
                    subtotal: pagoFinalARealizar,
                    productos: [{
                        id: productoInfo.data.id,
                        nombre: productoInfo.data.nombre,
                        descripcion: productoInfo.data.descripcion,
                        foto: productoInfo.data.foto,
                        valoracion: productoInfo.data.valoracion,
                        categoria: productoInfo.data.categoria,
                        precio: precioFinal,
                        descuento: descuento_inicial,
                        total: precioTotalAPagar,
                        cantidad: cantidadProductosPorPromo,
                        cantidadProductos: cantidadProductos,
                        
                    }]
                };
            } else {
                return {
                    id: producto_id,
                    nombre: productoInfo.data.nombre,
                    descripcion: productoInfo.data.descripcion,
                    foto: productoInfo.data.foto,
                    valoracion: productoInfo.data.valoracion,
                    categoria: productoInfo.data.categoria,
                    //cantidad: cantidad,
                    //cantidad_final: cantidad,
                    precio: precioFinal,
                    descuento: descuento_inicial,
                    subtotal: precioTotalAPagar,
                    cantidad: cantidad,
                    total: pagoFinalARealizar
                };
            }
        }));

        // Update warehouse and zone
        await Promise.all([
            axios.put(`${service_pedido}/pedido_almacen/${pedidoId}`, {
                almacen_id: almacenId
            }),
            axios.put(`${service_ubicacion}/ubicacion/${ubicacion_id}`, {
                zona_trabajo_id: regionId
            })
        ]);

        // Separate items into promotions and products
        const { promociones, productos } = detallesProcessed.reduce((acc, item) => {
            if ('productos' in item) {
                acc.promociones.push(item);
            } else {
                acc.productos.push(item);
            }
            return acc;
        }, { promociones: [], productos: [] });

        const subTotal = detallesProcessed.reduce((sum, detail) => sum + detail.subtotal, 0);
        const descuentoCupon = resultado.data.descuento;
        const precioFinal = subTotal - descuentoCupon;

        await axios.put(`${service_pedido}/pedido_precio/${pedidoId}`, {
            subtotal: subTotal,
            total: precioFinal
        });

        const response = {
            id: pedidoId,
            coordenadas: { latitud, longitud },
            detalles: {
                promociones,
                productos
            },
            region_id: regionId,
            subtotal: subTotal,
            descuento: descuentoCupon,
            total: precioFinal
        };

        res.status(201).json(response);
        await sendToQueue(response);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error procesando la solicitud',
            error: error.message
        });
    }
};

// Helper functions
const processWarehouseRegions = (zonas) => {
    return zonas.map((zona) => {
        try {
            let processedCoordinates = zona.poligono_coordenadas;

            if (!Array.isArray(processedCoordinates) || !processedCoordinates.every(coord =>
                Array.isArray(coord) && coord.length === 2 &&
                typeof coord[0] === 'number' && typeof coord[1] === 'number')) {
                throw new Error(`Formato inválido de coordenadas para zona ${zona.id}`);
            }

            return {
                warehouseId: zona.id,
                name: zona.nombre,
                polygon: {
                    type: "Feature",
                    properties: {
                        id: zona.id,
                        name: zona.nombre
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [processedCoordinates]
                    }
                }
            };
        } catch (error) {
            console.error(`Error procesando zona ${zona.id}:`, error);
            return null;
        }
    }).filter(region => region !== null);
};

const processWarehouses = (almacenes) => {
    return almacenes.map((almacen) => ({
        id: almacen.id,
        name: almacen.nombre,
        location: [Number(almacen.longitud), Number(almacen.latitud)],
        departamento: almacen.departamento
    }));
};

/*
export const getAlmacenZona = async (req, res) => {
    try {
        const { longitud, latitud } = req.body;

        if (longitud === undefined || latitud === undefined) {
            return res.status(400).json({ 
                message: 'Se requieren las coordenadas (longitud y latitud) en el body' 
            });
        }

        const [responseZona, responseAlmacen] = await Promise.all([
            axios.get(URLzona),
            axios.get(URLalmacen)
        ]);

        if (!responseZona.data || !responseAlmacen.data) {
            return res.status(404).json({ message: 'Datos no encontrados' });
        }

        // Crear las regiones de zonas (polígonos)
        const warehouseRegions = responseZona.data.map((zona) => {
            try {
                // Las coordenadas ya vienen como array de arrays desde PostgreSQL
                let processedCoordinates = zona.poligono_coordenadas;
                
                // Verificar que las coordenadas son válidas
                if (!Array.isArray(processedCoordinates) || !processedCoordinates.every(coord => 
                    Array.isArray(coord) && coord.length === 2 && 
                    typeof coord[0] === 'number' && typeof coord[1] === 'number')) {
                    throw new Error(`Formato inválido de coordenadas para zona ${zona.id}`);
                }

                // Crear un feature de GeoJSON
                const polygon = {
                    type: "Feature",
                    properties: {
                        id: zona.id,
                        name: zona.nombre
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [processedCoordinates]
                    }
                };

                console.log(`Polígono procesado para ${zona.nombre}:`, JSON.stringify(polygon));

                return {
                    warehouseId: zona.id,
                    name: zona.nombre,
                    polygon: polygon
                };
            } catch (error) {
                console.error(`Error procesando zona ${zona.id}:`, error);
                return null;
            }
        }).filter(region => region !== null);

        const warehouses = responseAlmacen.data.map((almacen) => ({
            id: almacen.id,
            name: almacen.nombre,
            location: [Number(almacen.longitud), Number(almacen.latitud)],
            departamento: almacen.departamento
        }));

        const coordinates = [Number(longitud), Number(latitud)];
        console.log('Punto a analizar:', coordinates);

        const analysis = analyzeLocation(warehouseRegions, coordinates, warehouses);

        res.status(200).json({
            coordenadas: {
                latitud,
                longitud
            },
            analysis
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error procesando la solicitud',
            error: error.message
        });
    }
};*/

function analyzeLocation(warehouseRegions, coordinates, warehouses) {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Formato de coordenadas inválido');
    }

    const point = turf.point(coordinates);
    console.log('Analizando punto:', coordinates);

    // Buscar la región que contiene el punto
    let containingRegion = null;
    for (const region of warehouseRegions) {
        try {
            console.log(`Verificando región ${region.name}`);

            const isInside = turf.booleanPointInPolygon(point, region.polygon);
            console.log(`Punto está dentro de ${region.name}:`, isInside);

            if (isInside) {
                containingRegion = {
                    warehouseId: region.warehouseId,
                    regionName: region.name,
                    area: turf.area(region.polygon),
                    boundaries: region.polygon.geometry.coordinates[0]
                };
                break;
            }
        } catch (error) {
            console.error(`Error procesando la región ${region.name}:`, error);
            console.error('Detalles del error:', error.message);
        }
    }

    // Calcular almacenes cercanos y distancias
    let nearestWarehouse = null;
    let minDistance = Infinity;
    let allWarehouses = [];

    for (const warehouse of warehouses) {
        try {
            const warehousePoint = turf.point(warehouse.location);
            const distance = turf.distance(point, warehousePoint, { units: 'kilometers' });

            const warehouseInfo = {
                id: warehouse.id,
                name: warehouse.name,
                distance: Math.round(distance * 100) / 100,
                location: warehouse.location,
                departamento: warehouse.departamento
            };

            allWarehouses.push(warehouseInfo);

            if (distance < minDistance) {
                minDistance = distance;
                nearestWarehouse = warehouseInfo;
            }
        } catch (error) {
            console.error(`Error procesando el almacén ${warehouse.id}:`, error);
        }
    }

    allWarehouses.sort((a, b) => a.distance - b.distance);

    // Si encontramos una región, buscar almacenes en esa región
    let warehousesInRegion = [];
    if (containingRegion) {
        warehousesInRegion = warehouses
            .filter(w => w.id.toString() === containingRegion.warehouseId.toString())
            .map(w => ({
                id: w.id,
                name: w.name,
                departamento: w.departamento,
                distance: Math.round(
                    turf.distance(
                        point,
                        turf.point(w.location),
                        { units: 'kilometers' }
                    ) * 100
                ) / 100
            }));
    }

    return {
        point: coordinates,
        region: containingRegion || 'El punto no está en ninguna región definida',
        nearestWarehouse,
        allWarehouses: allWarehouses,
        warehousesInRegion: warehousesInRegion.length > 0 ? warehousesInRegion : 'No hay almacenes en la región'
    };
}