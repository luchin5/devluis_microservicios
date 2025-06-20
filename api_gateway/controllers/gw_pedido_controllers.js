import axios from "axios";
//import redisClient from "../index.js";
import amqp from "amqplib";
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const service_ubicacion = process.env.MICRO_UBICACION;
const service_pedido = process.env.MICRO_PEDIDO;
const service_almacen = process.env.MICRO_ALMACEN;
const service_producto = process.env.MICRO_PRODUCTO;
const service_zonaproducto = process.env.MICRO_ZONAPRODUCTO;
const service_zonapromocion = process.env.MICRO_ZONAPROMOCION;
const service_cliente = process.env.MICRO_CLIENTE;
const service_auth = process.env.MICRO_AUTH;
const service_conductor = process.env.MICRO_CONDUCTOR;
const service_codigo = process.env.MICRO_CUPON;
const MAIN_QUEUE = "micro_pedidos";
//const RABBITMQ_URL = 'amqp://admin:admin123@64.23.206.83:5673'//|| 'amqp://admin:admin123@64.23.206.83:15673'; // Cambia esta URL si RabbitMQ está en otro host
const RABBITMQ_URL = process.env.RABBITMQ_URL;

const sendToQueue = async (pedido) => {
  try {
    console.log(" dentro de la funcion")
    const connection = await amqp.connect(RABBITMQ_URL);
    console.log(connection)
    const channel = await connection.createChannel();
    console.log("---------------->>>")
    const msg = JSON.stringify(pedido); // Convertir el pedido a JSON

    // Asegurarse de que la cola exista

    channel.sendToQueue(MAIN_QUEUE, Buffer.from(msg), {
      persistent: true,
    });

    console.log("Pedido enviado a la cola:", pedido);

    // Cerramos la conexión
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(
      "Error al enviar el pedido a la cola de RabbitMQ:",
      error.message
    );
  }
};

export const getPedidoAlmacenControllerGW = async (req,res) => {
  try {
    const {idalmacen,estado} = req.params
    const response = await axios
    .get(`${service_pedido}/pedido/almacen/${idalmacen}/${estado}`)
    .catch((error) =>{
      if(error.response){
        console.log("Error en la respuesta",error.response.status)
      }
      else{
        console.log("Error en la solicitud", error.message)
      }
      return null
    });
    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }
    res.status(200).json(response.data)
    
  } catch (error) {
    res.status(500).json({error:error.message})
  }
}

export const getPedidoHistoryConductorControllerGW = async (req, res) => {
  try {
    const { id, fecha } = req.params;
    console.log("......dentro de ");

    // 1️⃣ Obtener historial de pedidos
    const response = await axios
      .get(`${service_pedido}/pedido_history/${id}/${fecha}`)
      .catch((error) => {
        if (error.response) {
          console.log("Error en la respuesta:", error.response.status);
           
        } else {
          console.log("Error en la solicitud:", error.message);
        }
        return null; // Retorna null para manejar el error sin romper la ejecución
      });

    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }

  

    const pedidos = response.data;

    // 2️⃣ Obtener información de los clientes (IDs únicos)
    const clienteIds = [...new Set(pedidos.map((p) => p.cliente))];
    const clienteRequests = clienteIds.map((cid) =>
      axios.get(`${service_cliente}/cliente/${cid}`)
    );

    const clienteResponses = await Promise.all(clienteRequests);

    const clientes = {};
    const usuarioIds = {};

    clienteResponses.forEach((res) => {
      const data_cliente = res.data;
      clientes[data_cliente.id] = data_cliente.nombre;
      usuarioIds[data_cliente.id] = data_cliente.usuario_id; // Guardamos el usuario_id
    });

    const telefonoRequests = Object.values(usuarioIds).map((uid) =>
      axios
        .get(`${service_auth}/user_telefono/${uid}`)
        .then((res) => ({ 
          id: uid, 
          telefono: res.data.telefono || null  // Asegúrate de extraer el teléfono correctamente
        }))
        .catch(() => ({ id: uid, telefono: null }))
    );

    const telefonos = await Promise.all(telefonoRequests);
    const clienteTelefonos = telefonos.reduce((acc, { id, telefono }) => {
      acc[id] = telefono;
      return acc;
    }, {});

    // 3️⃣ Obtener detalles de productos en paralelo
    const productIds = [
      ...new Set(
        pedidos.flatMap((p) => p.detalles_pedido.map((d) => d.producto_id))
      ),
    ];
    const productRequests = productIds.map((pid) =>
      axios.get(`${service_producto}/producto/${pid}`)
    );

    const productResponses = await Promise.all(productRequests);

    const productos = productResponses.reduce((acc, res) => {
      acc[res.data.id] = res.data.nombre; // Guardamos en un diccionario { id: nombre }
      return acc;
    }, {});

    // 4️⃣ Obtener detalles de promociones en paralelo
    const promoIds = [
      ...new Set(
        pedidos.flatMap((p) =>
          p.detalles_pedido
            .map((d) => d.promocion_id)
            .filter((pid) => pid !== null)
        )
      ),
    ];
    const promoRequests = promoIds.map((pid) =>
      axios.get(`${service_producto}/promocion/${pid}`)
    );

    const promoResponses = await Promise.all(promoRequests);

    const promociones = promoResponses.reduce((acc, res) => {
      acc[res.data.id] = res.data.nombre; // Guardamos en un diccionario { id: nombre }
      return acc;
    }, {});

    // 5️⃣ Obtener ubicaciones en paralelo
    const ubicacionIds = [
      ...new Set(pedidos.map((p) => p.ubicacion).filter((uid) => uid !== null)),
    ];
    const ubicacionRequests = ubicacionIds.map((uid) =>
      axios.get(`${service_ubicacion}/ubicacion/${uid}`)
    );

    const ubicacionResponses = await Promise.all(ubicacionRequests);

    const ubicaciones = ubicacionResponses.reduce((acc, res) => {
      acc[res.data.id] = res.data; // Guardamos el objeto de la ubicación
      return acc;
    }, {});

    // 6️⃣ Construir respuesta final con nombres de productos, clientes, promociones y ubicaciones
    const pedidosCompletos = pedidos.map((pedido) => ({
      ...pedido,
      cliente_nombre: clientes[pedido.cliente] || "Desconocido",
      cliente_telefono: clienteTelefonos[usuarioIds[pedido.cliente]] || "No disponible",
      ubicacion: ubicaciones[pedido.ubicacion] || null, // Agregamos la ubicación
      detalles_pedido: pedido.detalles_pedido.map((detalle) => ({
        ...detalle,
        producto_nombre: detalle.promocion_id
          ? promociones[detalle.promocion_id] || "Promoción desconocida"
          : productos[detalle.producto_id] || "Producto desconocido",
      })),
    }));

    res.status(200).json(pedidosCompletos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//ENDPOINT PARA LA CENTRAL TOTAL DE PEDIDOS PENDIENTES
export const getPedidoPendientesControllerGW = async (req,res) => {
  try {
    const response = await axios
    .get(`${service_pedido}/pedido_pendientes`)
    .catch((error) =>{
      if(error.response){
        console.log("Error en la respuesta",error.response.status)
      }
      else{
        console.log("Error en la solicitud", error.message)
      }
      return null
    });
    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }
    res.status(200).json(response.data)
    
  } catch (error) {
    res.status(500).json({error:error.message})
  }
}

//ENDPOINT PARA LA CENTRAL TOTAL DE PEDIDOS EN PROCESO
export const getEnProcesoControllerGW = async (req,res) => {
  try {
    const response = await axios
    .get(`${service_pedido}/pedido_enproceso`)
    .catch((error) =>{
      if(error.response){
        console.log("Error en la respuesta",error.response.status)
      }
      else{
        console.log("Error en la solicitud", error.message)
      }
      return null
    });
    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }
    res.status(200).json(response.data)
    
  } catch (error) {
    res.status(500).json({error:error.message})
  }
}



//ENDPOINT PARA LA CENTRAL TOTAL DE PEDIDOS ENTREGADOS
export const getPedidoEntregadosControllerGW = async (req,res) => {
  try {
    const response = await axios
    .get(`${service_pedido}/pedido_entregado`)
    .catch((error) =>{
      if(error.response){
        console.log("Error en la respuesta",error.response.status)
      }
      else{
        console.log("Error en la solicitud", error.message)
      }
      return null
    });
    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }
    res.status(200).json(response.data)
    
  } catch (error) {
    res.status(500).json({error:error.message})
  }
}

//ENDPOINT PARA LOS PEDIDOS SEMANALES TOTALES
export const getPedidoSemanalGW = async (req,res) => {
  try {
    const response = await axios
    .get(`${service_pedido}/pedido_semanal`)
    .catch((error) =>{
      if(error.response){
        console.log("Error en la respuesta",error.response.status)
      }
      else{
        console.log("Error en la solicitud", error.message)
      }
      return null
    });
    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }
    res.status(200).json(response.data)
    
  } catch (error) {
    res.status(500).json({error:error.message})
  }
}




export const getPedidosControllerGW = async (req, res) => {
  console.log("......get pedido controller");
  
  const cacheKey = "pedidos_cache";
  try {
    /*
    console.log("........Intentando obtener datos de Redis");

    // Intentar obtener datos de Redis con manejo de errores
    let cachedData;
    try {
      cachedData = await redisClient.get(cacheKey);
      console.log("Datos de caché:", cachedData);
    } catch (redisError) {
      console.error("Error al obtener datos de Redis:", redisError.message);
    }

    // Si hay datos en caché, devolverlos
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }
*/
    // Si no hay datos en caché, hacer la solicitud a la API
    const response = await axios.get(`${service_pedido}/pedido`);
    console.log("Respuesta de la API de pedidos:", response.data);

    if (response && response.data) {
      // Guardar en caché los datos de respuesta (opcional si Redis funciona)
    /*  try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data));
      } catch (redisSetError) {
        console.error(
          "Error al guardar datos en Redis:",
          redisSetError.message
        );
      }*/
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    console.error("Error al obtener pedidos:", error.message);
    res.status(500).send("Error fetching orders");
  }
};

//ENDPOINT QUE VERIFICA PEDIDO CON CONDUCTOR ID
export const getPedidoCondControllerGW = async (req, res) => {
  try {
    // Si no hay datos en caché, hacer la solicitud a la API
    const {id} = req.params
    const response = await axios.get(`${service_pedido}/pedido_cond/${id}`);
    console.log("Respuesta de la API de pedidos:", response.data);

    if (response && response.data) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    console.error("Error al obtener pedidos:", error.message);
    res.status(500).send("Error pedido conductor id");
  }
};


export const postInfoPedido = async (req, res) => {
  const fechaActual = new Date();
  try {
    const fechaISO = fechaActual.toISOString();
    let {
      cliente_id,
      //descuento,
      //fecha,
      //tipo,
      estado,
      observacion,
      tipo_pago,
      ubicacion_id,
      cupon_id, // Ahora recibimos cupon_id en lugar de descuento
      delivery_id, // Ahora recibimos delivery_id en lugar de tipo
      codigo_id, // Nuevo campo opcional
      total: totalEnviado, // Recibimos el total del cliente
      detalles,
    } = req.body;
//cambiar el tipo a delivery_id, llamar al endpoint get ${service_pedido}/delivery_pedido/{delivery_id}
//despues de eso extraes precio y eso lo tomas como para agregarle precio al final entocnes al final donde das producto info agregale ese detalle de precio, y en la logica haría que al total se le sume eso tambien por favor
//cuando tomas el cupon_id consultas la siguiente ${service_codigo}/cupon/${cupon_id} dependiendo de lo que ingrese ese endpoint solo extraes descuento alli tiene un valor numerico que tu lo vas a tomar como si fuera un porcentaje
//eso afecta en los calculos finales cuando se quiere hacer un descuento  entonces al total le sacas un porcentaje de esto depnedneindo de lo que extraigas en descuento y sacas por ejemplo si es el 20 entonces sacas el 20% del total y al final le restas
//finalmente ya no necesitamos el campo de descuento por ahora ya que no es necesario ya que el descuento se hara por cupon_id por favor eso nomas
// Preprocesar detalles: reemplazar producto_id null usando promocion_id
    detalles = await Promise.all(
      detalles.map(async (detalle) => {
        if (detalle.producto_id === null && detalle.promocion_id) {
          try {
            const response = await axios.get(
              `${service_producto}/get_producto_id/${detalle.promocion_id}`
            );
            // Actualizamos el producto_id con el valor obtenido
            return {
              ...detalle,
              producto_id: response.data.producto_id
            };
          } catch (error) {
            console.error("Error obteniendo producto de promoción:", error);
            return detalle; // Devolvemos el detalle original si hay error
          }
        }
        return detalle; // No es necesario modificar
      })
    );    
console.log("------DETALLES--------------------------->>>>>")
console.log(detalles)



let deliveryCost = 0;  // Inicializamos costo de delivery
    if (delivery_id) {
      try {
        const deliveryRes = await axios.get(
          `${service_pedido}/delivery_pedido/${delivery_id}`
        );
        deliveryCost = deliveryRes.data.precio; // Extraemos el precio del delivery
      } catch (error) {
        console.error("Error obteniendo costo de delivery:", error);
        // Continuamos sin delivery cost si hay error
      }
    }

    let discountPercentage = 0;  // Inicializamos porcentaje de descuento
    let productoCupon = null; // Variable para almacenar el ID del producto asociado al cupón    

    // 3. OBTENEMOS DESCUENTO POR CUPÓN (si existe)
    if (cupon_id) {
      try {
        const cuponRes = await axios.get(
          `${service_codigo}/cupon/${cupon_id}`
        );
        discountPercentage = cuponRes.data.descuento; // Extraemos el % de descuento
        productoCupon = cuponRes.data.producto_id; //SACAMOS EL PRODUCTO ID
      } catch (error) {
        console.error("Error obteniendo descuento de cupón:", error);
        // Continuamos sin descuento si hay error
      }
    }

    let codigoDiscountPercentage = 0; // Descuento del código
    if (codigo_id) {
      try {
        const codigoRes = await axios.get(
          `${service_pedido}/codigo_descuento/${codigo_id}`
        );
        codigoDiscountPercentage = codigoRes.data.descuento;
      } catch (error) {
        console.error("Error obteniendo descuento de código:", error);
      }
    }
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    console.log(codigoDiscountPercentage)



    let latitud,
      longitud,
      id,
      departamento,
      provincia,
      distrito,
      direccion,
      cliente,
      zonaTrabajo;
    try {
      const ubicacionRes = await axios.get(
        `${service_ubicacion}/ubicacion/${ubicacion_id}`
      );
      //console.log(ubicacionRes.data);
      id = ubicacionRes.data.id;
      latitud = ubicacionRes.data.latitud;
      longitud = ubicacionRes.data.longitud;
      departamento = ubicacionRes.data.departamento;
      provincia = ubicacionRes.data.provincia;
      distrito = ubicacionRes.data.distrito;
      direccion = ubicacionRes.data.direccion;
      cliente = ubicacionRes.data.cliente_id;
      zonaTrabajo = ubicacionRes.data.zona_trabajo_id;

      if (!latitud || !longitud) {
        return res.status(400).json({ message: "Coordenadas no disponibles" });
      }
    } catch (error) {
      return res.status(404).json({ message: "Ubicación no encontrada" });
    }

    const [responseZona, responseAlmacen, resultado] = await Promise.all([
      axios.get(`${service_ubicacion}/zona`),
      axios.get(`${service_almacen}/almacen`),
      axios.post(`${service_pedido}/pedido`, {
        cliente_id,
        descuento: 0, // Inicializamos descuento en 0
        fecha: fechaISO,
        estado,
        observacion,
        tipo_pago,
        ubicacion_id,
        delivery_id,
        cupon_id
      }),
    ]);

    const warehouseRegions = processWarehouseRegions(responseZona.data);
    const warehouses = processWarehouses(responseAlmacen.data);
    const coordinates = [Number(longitud), Number(latitud)];
    const analysis = analyzeLocation(warehouseRegions, coordinates, warehouses);

    if (!resultado.data) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const pedidoId = resultado.data.id;
    const clienteId = resultado.data.cliente_id;
    const regionId = analysis.region.warehouseId;
    const almacenId = analysis.nearestWarehouse.id;
    const almacenes = analysis.nearestWarehouseIds;

    // Process each order detail
    const detallesProcessed = await Promise.all(
      detalles.map(async (detalle) => {
        const { producto_id, cantidad, promocion_id } = detalle;

        // Fetch product and promotion info in parallel
        const [productoInfo, promocionInfo, cantidadPromos] = await Promise.all(
          [
            axios.get(`${service_producto}/producto/${producto_id}`),
            promocion_id
              ? axios.get(`${service_producto}/promocion/${promocion_id}`)
              : Promise.resolve(null),
            promocion_id
              ? axios.get(
                  `${service_producto}/cantidadprod/${promocion_id}/${producto_id}`
                )
              : Promise.resolve(null),
          ]
        );

        // Calculate price based on promotion
        const precio = await axios.get(
          promocion_id
            ? `${service_zonapromocion}/preciopromo/${regionId}/${promocion_id}`
            : `${service_zonaproducto}/precioZonaProducto/${regionId}/${producto_id}` 
        );

        const precioFinal = precio.data.precio_regular;//-> primer cambio
        const descuento_inicial = precio.data.descuento;
        const precioTotalAPagar = precio.data.precio_normal;
        const pagoFinalARealizar = precioTotalAPagar * cantidad;
        const cantidadProductosPorPromo = cantidadPromos?.data?.cantidad;
        const cantidadProductos = cantidadProductosPorPromo * cantidad;

        // Create detail record
        await axios.post(`${service_pedido}/det_pedido`, {
          pedido_id: pedidoId,
          producto_id,
          cantidad,
          promocion_id,
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
            productos: [
              {
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
              },
            ],
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
            precio: precioFinal,//<-SEGUNDO CAMBIO
            descuento: descuento_inicial,
            subtotal: precioTotalAPagar,
            cantidad: cantidad,
            total: pagoFinalARealizar,
          };
        }
      })
    );

    // Update warehouse and zone
    await Promise.all([
      axios.put(`${service_pedido}/pedido_almacen/${pedidoId}`, {
        almacen_id: almacenId,
      }),
      axios.put(`${service_ubicacion}/ubicacion/${ubicacion_id}`, {
        zona_trabajo_id: regionId,
      }),
    ]);

    // Separate items into promotions and products
    const { promociones, productos } = detallesProcessed.reduce(
      (acc, item) => {
        if ("productos" in item) {
          acc.promociones.push(item);
        } else {
          acc.productos.push(item);
        }
        return acc;
      },
      { promociones: [], productos: [] }
    );

    const subTotal = detallesProcessed.reduce(
      (sum, detail) => {
        // Si es una promoción, usar 'subtotal'
        if ("productos" in detail) {
          return sum + detail.subtotal;
        }
        // Si es un producto simple, usar 'total'
        return sum + detail.total;
      },
      0
    );

    let discountAmount = 0;
    if (cupon_id && !codigo_id) {
      // Buscar el producto en los detalles
      const productoConDescuento = detallesProcessed.find(detail => 
        !("productos" in detail) && detail.id === productoCupon
      );
      
      if (productoConDescuento) {
        // Calcular descuento solo sobre el total de ese producto
        discountAmount = parseFloat((productoConDescuento.total * (discountPercentage / 100)).toFixed(2));
      }
    }
    else if (!cupon_id && codigo_id) {
  discountAmount = parseFloat((subTotal * (codigoDiscountPercentage / 100)).toFixed(2));
}
else if (cupon_id && codigo_id) {
  let cuponDiscount = 0;
  let codigoDiscount = parseFloat((subTotal * (codigoDiscountPercentage / 100)).toFixed(2));
  
  // Calculamos descuento del cupón (solo para el producto)
  const productoConDescuento = detallesProcessed.find(detail => 
    !("productos" in detail) && detail.id === productoCupon
  );
  
  if (productoConDescuento) {
    cuponDiscount = parseFloat((productoConDescuento.total * (discountPercentage / 100)).toFixed(2));
  }
  
  // Calculamos el promedio de ambos descuentos
  discountAmount = parseFloat(((cuponDiscount + codigoDiscount) / 2).toFixed(2));
}
  
    //LOG DISCOCUNT AMOUNT
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%DESCUENTOOOOOOOO")
    console.log(discountAmount)

    // 2. Descuento por código (aplica al subtotal general)
    /*
    if (codigoDiscountPercentage > 0) {
      discountAmount += subTotal * (codigoDiscountPercentage / 100);
    }*/

    //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    //console.log(discountAmount)


    // 3. Total final: (Subtotal - Descuento) + Delivery
    const precioFinal = (subTotal - discountAmount) + deliveryCost;

    await axios.put(`${service_pedido}/pedido_precio/${pedidoId}`, {
      subtotal: subTotal,
      total: precioFinal,
      descuento: discountAmount,
    });

    async function fetchWarehouseEvents(warehouseIds) {
      try {
        const eventPromises = warehouseIds.map((id) =>
          axios
            .get(`${service_conductor}/eventos/${id}`)
            .then((response) => ({
              almacen_id: id,
              nombre_evento: response.data.nombre,
            }))
            .catch((error) => ({
              almacen_id: id,
              nombre_evento: null,
              error: "Event not found",
            }))
        );
        return await Promise.all(eventPromises);
      } catch (error) {
        console.error("Error fetching warehouse events:", error);
        return [];
      }
    }

    const cliente_completo = await axios.get(
      `${service_cliente}/cliente/${clienteId}`
    );
    const data_cliente = cliente_completo.data;

    const usuario= data_cliente.usuario_id;

    const telefono_response = await axios.get(`${service_auth}/user_telefono/${usuario}`);
    const data_telefono = telefono_response.data; // Store the telephone data

    const warehouseEvents = await fetchWarehouseEvents(almacenes);

    const pedido_completo = await axios.get(
      `${service_pedido}/pedido/${pedidoId}`
    );
    const data_pedido = pedido_completo.data;

    const cliente_con_telefono_email = {
      ...data_cliente,
      telefono: data_telefono.telefono,  
      email: data_telefono.email         
    };

    const response = {
      id: pedidoId,
      ubicacion: {
        id,
        latitud,
        longitud,
        departamento,
        provincia,
        distrito,
        direccion,
        cliente,
        zonaTrabajo,
      },
      detalles: {
        promociones,
        productos,
      },
      region_id: regionId,
      almacen_id: almacenId,
      delivery: deliveryCost,
      subtotal: subTotal,
      descuento: discountAmount, 
      total: precioFinal,
      AlmacenesPendientes: almacenes.map((id) => {
        const eventInfo = warehouseEvents.find(
          (event) => event.almacen_id === id
        );
        return {
          id,
          nombre_evento: eventInfo ? eventInfo.nombre_evento : null,
        };
      }),
      Cliente: cliente_con_telefono_email,
      emitted_time: new Date().toISOString(), // Add emission time
      expired_time: new Date(
        new Date().getTime() + 1 * 60 * 1000
      ).toISOString(),
      pedidoinfo: data_pedido,
    };

    /*
        socket.emit('new_order', {
            ...orderData,
            emitted_time: new Date().toISOString(),
            timeout_duration: 30
        })


        socket.on('order_timeout', async (data) => {
            try {
                const { orderId } = data;
                
                // Remove from current queue
                await channel.ack(data.message);
                
                // Update order status in archive
                await axios.put(`${service_pedido}/pedido/${orderId}`, {
                    estado: 'rejected_timeout'
                });
                
                // Notify all clients about the order removal
                socket.broadcast.emit('order_removed', {
                    orderId,
                    reason: 'timeout'
                });
                
                // Re-emit all active orders to ensure synchronization
                const activeOrders = await axios.get(`${service_pedido}/pedido`);
                socket.broadcast.emit('sync_update', activeOrders.data);
            } catch (error) {
                console.error('Error handling order timeout:', error);
            }
        });
        */

    const totalCalculado = precioFinal;

    if (Math.abs(totalEnviado - totalCalculado) > 0.1) { // Tolerancia de 0.01 para decimales
      return res.status(400).json({
        message: "Los totales no coinciden",
        total_enviado: totalEnviado,
        total_calculado: totalCalculado,
        diferencia: totalEnviado - totalCalculado,
        detalle: "El total enviado por el cliente no coincide con el cálculo del servidor"
      });
    }
    console.log("ENVIANDO EN LA COLA ----------------------->>>>")
    console.log(response)
    //await sendToQueue(response);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error procesando la solicitud",
      error: error.message,
    });
  }
};

const processWarehouseRegions = (zonas) => {
  return zonas
    .map((zona) => {
      try {
        let processedCoordinates = zona.poligono_coordenadas;

        if (
          !Array.isArray(processedCoordinates) ||
          !processedCoordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              typeof coord[0] === "number" &&
              typeof coord[1] === "number"
          )
        ) {
          throw new Error(
            `Formato inválido de coordenadas para zona ${zona.id}`
          );
        }

        return {
          warehouseId: zona.id,
          name: zona.nombre,
          polygon: {
            type: "Feature",
            properties: {
              id: zona.id,
              name: zona.nombre,
            },
            geometry: {
              type: "Polygon",
              coordinates: [processedCoordinates],
            },
          },
        };
      } catch (error) {
        console.error(`Error procesando zona ${zona.id}:`, error);
        return null;
      }
    })
    .filter((region) => region !== null);
};

const processWarehouses = (almacenes) => {
  return almacenes.map((almacen) => ({
    id: almacen.id,
    name: almacen.nombre,
    location: [Number(almacen.longitud), Number(almacen.latitud)],
    departamento: almacen.departamento,
  }));
};

function analyzeLocation(warehouseRegions, coordinates, warehouses) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error("Formato de coordenadas inválido");
  }

  const point = turf.point(coordinates);
  console.log("Analizando punto:", coordinates);

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
          boundaries: region.polygon.geometry.coordinates[0],
        };
        break;
      }
    } catch (error) {
      console.error(`Error procesando la región ${region.name}:`, error);
      console.error("Detalles del error:", error.message);
    }
  }

  // Calcular almacenes cercanos y distancias
  let nearestWarehouse = null;
  let minDistance = Infinity;
  let allWarehouses = [];

  for (const warehouse of warehouses) {
    try {
      const warehousePoint = turf.point(warehouse.location);
      const distance = turf.distance(point, warehousePoint, {
        units: "kilometers",
      });

      const warehouseInfo = {
        id: warehouse.id,
        name: warehouse.name,
        distance: Math.round(distance * 100) / 100,
        location: warehouse.location,
        departamento: warehouse.departamento,
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

  const nearestWarehouseIds = allWarehouses
    .slice(0, 3)
    .map((warehouse) => warehouse.id);

  // Si encontramos una región, buscar almacenes en esa región
  let warehousesInRegion = [];
  if (containingRegion) {
    warehousesInRegion = warehouses
      .filter(
        (w) => w.id.toString() === containingRegion.warehouseId.toString()
      )
      .map((w) => ({
        id: w.id,
        name: w.name,
        departamento: w.departamento,
        distance:
          Math.round(
            turf.distance(point, turf.point(w.location), {
              units: "kilometers",
            }) * 100
          ) / 100,
      }));
  }

  return {
    point: coordinates,
    region: containingRegion || "El punto no está en ninguna región definida",
    nearestWarehouse,
    nearestWarehouseIds,
    allWarehouses: allWarehouses,
    warehousesInRegion:
      warehousesInRegion.length > 0
        ? warehousesInRegion
        : "No hay almacenes en la región",
  };
}


//CONTROLLER PARA TRAER TODOS LOS PEDIDOS EN PROCESO PARA LA CENTRAL
export const getEnprocesoControllerGW = async (req, res) => {
  try {
    // 1. Obtener todos los pedidos en proceso
    const pedidosResponse = await axios.get(`${service_pedido}/pedido_distribuidor_enproceso`);
    
    if (!pedidosResponse.data || !Array.isArray(pedidosResponse.data)) {
      return res.status(404).json({ message: "No se encontraron pedidos en proceso" });
    }
    
    // 2. Enriquecer cada pedido con información adicional
    const pedidosEnriquecidos = await Promise.all(
      pedidosResponse.data.map(async (pedido) => {
        // Obtener información del cliente usando cliente_id del pedido
        const clienteResponse = await axios.get(`${service_cliente}/cliente/${pedido.cliente_id}`)
          .catch(() => ({ data: "No hay datos disponibles" }));
        const clienteData = clienteResponse.data;
        
        // Obtener información del teléfono usando usuario_id del cliente
        let telefonoData = "No hay datos disponibles";
        if (clienteData && clienteData !== "No hay datos disponibles" && clienteData.usuario_id) {
          const telefonoResponse = await axios.get(`${service_auth}/user_telefono/${clienteData.usuario_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          telefonoData = telefonoResponse.data;
        }
        
        // Obtener información de ubicación usando ubicacion_id del pedido
        let ubicacionData = "No hay datos disponibles";
        if (pedido.ubicacion_id) {
          const ubicacionResponse = await axios.get(`${service_ubicacion}/ubicacion/${pedido.ubicacion_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          ubicacionData = ubicacionResponse.data;
        }
        
        // Obtener información del conductor usando conductor_id del pedido
        let conductorData = "No hay datos disponibles";
        if (pedido.conductor_id) {
          const conductorResponse = await axios.get(`${service_conductor}/conductor/${pedido.conductor_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          conductorData = conductorResponse.data;
        }
        
        // Combinar toda la información en un solo objeto
        return {
          ...pedido,
          cliente: clienteData || "No hay datos disponibles",
          telefono: telefonoData || "No hay datos disponibles",
          ubicacion: ubicacionData || "No hay datos disponibles",
          conductor: conductorData || "No hay datos disponibles"
        };
      })
    );
    
    res.status(200).json(pedidosEnriquecidos);
  } catch (error) {
    console.error("Error al obtener pedidos en proceso:", error.message);
    res.status(500).json({
      message: "Error al procesar la solicitud de pedidos en proceso",
      error: error.message
    });
  }
};


//CONTROLLER PARA TRAER TODOS LOS PEDIDOS EN PROCESO PARA LA CENTRAL
export const getPendienteControllerGW = async (req, res) => {
  try {
    // 1. Obtener todos los pedidos pendientes
    const pedidosResponse = await axios.get(`${service_pedido}/pedido_distribuidor_pendiente`);
    
    if (!pedidosResponse.data || !Array.isArray(pedidosResponse.data)) {
      return res.status(404).json({ message: "No se encontraron pedidos pendientes" });
    }
    
    // 2. Enriquecer cada pedido con información adicional
    const pedidosEnriquecidos = await Promise.all(
      pedidosResponse.data.map(async (pedido) => {
        // Obtener información del cliente usando cliente_id del pedido
        const clienteResponse = await axios.get(`${service_cliente}/cliente/${pedido.cliente_id}`)
          .catch(() => ({ data: "No hay datos disponibles" }));
        const clienteData = clienteResponse.data;
        
        // Obtener información del teléfono usando usuario_id del cliente
        let telefonoData = "No hay datos disponibles";
        if (clienteData && clienteData !== "No hay datos disponibles" && clienteData.usuario_id) {
          const telefonoResponse = await axios.get(`${service_auth}/user_telefono/${clienteData.usuario_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          telefonoData = telefonoResponse.data;
        }
        
        // Obtener información de ubicación usando ubicacion_id del pedido
        let ubicacionData = "No hay datos disponibles";
        if (pedido.ubicacion_id) {
          const ubicacionResponse = await axios.get(`${service_ubicacion}/ubicacion/${pedido.ubicacion_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          ubicacionData = ubicacionResponse.data;
        }
        
        // Obtener información del distribuidor usando almacen_id del pedido
        let distribuidorData = "No hay datos disponibles";
        if (pedido.almacen_id) {
          const distribuidorResponse = await axios.get(`${service_conductor}/distribuidor_almacen/${pedido.almacen_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          distribuidorData = distribuidorResponse.data;
        }
        
        // Obtener información del almacén usando almacen_id del pedido
        let almacenData = "No hay datos disponibles";
        if (pedido.almacen_id) {
          const almacenResponse = await axios.get(`${service_almacen}/almacen/${pedido.almacen_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          almacenData = almacenResponse.data;
        }
        
        // Combinar toda la información en un solo objeto
        return {
          ...pedido,
          cliente: clienteData || "No hay datos disponibles",
          telefono: telefonoData || "No hay datos disponibles",
          ubicacion: ubicacionData || "No hay datos disponibles",
          distribuidor: distribuidorData || "No hay datos disponibles",
          almacen: almacenData || "No hay datos disponibles"
        };
      })
    );
    
    res.status(200).json(pedidosEnriquecidos);
    
  } catch (error) {
    console.error("Error al obtener pedidos pendientes:", error.message);
    res.status(500).json({
      message: "Error al procesar la solicitud de pedidos pendientes",
      error: error.message
    });
  }
};


export const getEntregadosControllerGW = async (req, res) => {
  try {
    // 1. Obtener todos los pedidos entregados
    const pedidosResponse = await axios.get(`${service_pedido}/pedido_distribuidor_entregado`);
    
    if (!pedidosResponse.data || !Array.isArray(pedidosResponse.data)) {
      return res.status(404).json({ message: "No se encontraron pedidos entregados" });
    }
    
    // 2. Enriquecer cada pedido con información adicional
    const pedidosEnriquecidos = await Promise.all(
      pedidosResponse.data.map(async (pedido) => {
        // Obtener información del cliente usando cliente_id del pedido
        const clienteResponse = await axios.get(`${service_cliente}/cliente/${pedido.cliente_id}`)
          .catch(() => ({ data: "No hay datos disponibles" }));
        const clienteData = clienteResponse.data;
        
        // Obtener información del teléfono usando usuario_id del cliente
        let telefonoData = "No hay datos disponibles";
        if (clienteData && clienteData !== "No hay datos disponibles" && clienteData.usuario_id) {
          const telefonoResponse = await axios.get(`${service_auth}/user_telefono/${clienteData.usuario_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          telefonoData = telefonoResponse.data;
        }
        
        // Obtener información de ubicación usando ubicacion_id del pedido
        let ubicacionData = "No hay datos disponibles";
        if (pedido.ubicacion_id) {
          const ubicacionResponse = await axios.get(`${service_ubicacion}/ubicacion/${pedido.ubicacion_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          ubicacionData = ubicacionResponse.data;
        }
        
        // Obtener información del distribuidor usando conductor_id del pedido
        let distribuidorData = "No hay datos disponibles";
        if (pedido.conductor_id) {
          const distribuidorResponse = await axios.get(`${service_conductor}/conductor/${pedido.conductor_id}`)
            .catch(() => ({ data: "No hay datos disponibles" }));
          distribuidorData = distribuidorResponse.data;
        }
        
        // Combinar toda la información en un solo objeto
        return {
          ...pedido,
          cliente: clienteData || "No hay datos disponibles",
          telefono: telefonoData || "No hay datos disponibles",
          ubicacion: ubicacionData || "No hay datos disponibles",
          distribuidor: distribuidorData || "No hay datos disponibles"
        };
      })
    );
    
    res.status(200).json(pedidosEnriquecidos);
    
  } catch (error) {
    console.error("Error al obtener pedidos entregados:", error.message);
    res.status(500).json({
      message: "Error al procesar la solicitud de pedidos entregados",
      error: error.message
    });
  }
};

export const getDistribuidorTotalControllerGW = async (req,res) => {
  try {
    const response = await axios
    .get(`${service_pedido}/pedido_distribuidor_total`)
    .catch((error) =>{
      if(error.response){
        console.log("Error en la respuesta",error.response.status)
      }
      else{
        console.log("Error en la solicitud", error.message)
      }
      return null
    });
    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }
    res.status(200).json(response.data)
    
  } catch (error) {
    res.status(500).json({error:error.message})
  }
}


export const getDistribuidorConteoTotalControllerGW = async (req, res) => {
  try {
    const { fecha } = req.params;
    const response = await axios
      .get(`${service_pedido}//${fecha}`)
      .catch((error) => {
        if (error.response) {
          console.log("Error en la respuesta", error.response.status);
        } else {
          console.log("Error en la solicitud", error.message);
        }
        return null;
      });

    // Definir almacenes esperados
    const almacenesEsperados = [1, 3, 4];
    let datos = response && response.data ? response.data : [];

    // Convertir los datos en un objeto para fácil acceso
    const datosMap = new Map(datos.map((item) => [item.almacen_id, item]));

    // Construir la respuesta asegurando que todos los almacenes estén presentes
    const resultadoCompleto = await Promise.all(
      almacenesEsperados.map(async (almacen_id) => {
        const total_pedidos = datosMap.has(almacen_id) ? datosMap.get(almacen_id).total_pedidos : "0";
        
        // Nueva consulta al endpoint de conductor
        let conductorResponse = await axios
          .get(`${service_conductor}/distribuidor_almacen/${almacen_id}`)
          .catch((error) => {
            console.log(`Error obteniendo datos del almacén ${almacen_id}`, error.message);
            return { data: null };
          });

        // Filtrar distribuidores para eliminar "Demo Demo"
        const distribuidorFiltrado = (conductorResponse.data || []).filter(
          (d) => d.nombres !== "Demo" || d.apellidos !== "Demo"
        );

        return {
          almacen_id,
          total_pedidos,
          distribuidor: distribuidorFiltrado,
        };
      })
    );

    res.status(200).json(resultadoCompleto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDistribudoresConteoControllerGW = async (req, res) => {
  try {
    const { fecha, id } = req.params;
    
    // 1️⃣ Primera consulta: Obtener pedidos del distribuidor
    const response = await axios.get(`${service_pedido}/pedido_distribuidor_conteo_pedidos/${fecha}/${id}`);
    
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: "No hay pedidos disponibles" });
    }
    
    // Procesar todos los pedidos en lugar de solo el primero
    const pedidos = response.data;
    
    // Obtener datos adicionales para cada pedido
    const resultados = await Promise.all(pedidos.map(async (pedido) => {
      // 2️⃣ Segunda consulta: Obtener datos del almacén
      const almacenData = await axios.get(`${service_almacen}/almacen/${pedido.almacen_id}`).catch(() => null);
      
      // 3️⃣ Tercera consulta: Obtener datos del cliente
      const clienteData = await axios.get(`${service_cliente}/cliente/${pedido.cliente_id}`).catch(() => null);
      
      // 4️⃣ Cuarta consulta: Obtener dirección del cliente
      const direccionData = await axios.get(`${service_ubicacion}/ubicacion/${pedido.ubicacion_id}`).catch(() => null);
      
      // 5️⃣ Quinta consulta: Obtener teléfono del usuario del cliente (solo si hay datos del cliente)
      let telefonoData = null;
      if (clienteData && clienteData.data) {
        telefonoData = await axios.get(`${service_auth}/user_telefono/${clienteData.data.usuario_id}`).catch(() => null);
      }
      
      // Retornar resultado combinado para este pedido
      return {
        pedido: pedido || "No hay datos disponibles",
        almacen: almacenData?.data || "No hay datos disponibles",
        cliente: clienteData?.data || "No hay datos disponibles",
        direccion: direccionData?.data || "No hay datos disponibles",
        telefono: telefonoData?.data || "No hay datos disponibles",
      };
    }));
    
    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPedidosInfoDetalles = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1️⃣ Obtener pedidos del distribuidor
    const response = await axios.get(`${service_pedido}/allpedidodetalle/${id}`);
    const pedidos = response.data;
    
    if (!pedidos || pedidos.length === 0) {
      return res.status(404).json({ message: "No hay pedidos disponibles" });
    }
    
    // 2️⃣ Obtener información del cliente y ubicación (solo de un pedido, asumiendo que todos tienen el mismo cliente y ubicación)
    /*
    const { cliente_id, ubicacion_id } = pedidos[0];
    const [clienteResponse, ubicacionResponse] = await Promise.all([
      axios.get(`${service_cliente}/cliente/${cliente_id}`),
      axios.get(`${service_ubicacion}/ubicacion/${ubicacion_id}`)
    ]);
    
    const clienteInfo = clienteResponse.data;
    const direccion = ubicacionResponse.data;*/
    
    // 3️⃣ Obtener información de productos o promociones
    const detallesPedidos = await Promise.all(pedidos.map(async pedido => {
      let productoInfo;
      if (pedido.promocion_id === null) {
        const productoResponse = await axios.get(`${service_producto}/producto/${pedido.producto_id}`);
        productoInfo = productoResponse.data;
      } else {
        const promocionResponse = await axios.get(`${service_producto}/promocion/${pedido.promocion_id}`);
        productoInfo = promocionResponse.data;
      }
      
      return {
        ...pedido,
        productoInfo
      };
    }));
    
    // 4️⃣ Responder con la data consolidada
    res.status(200).json({
      detallesPedidos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPedidosPrimeraFecha = async (req, res) => {
  try {
    
    const response = await axios.get(`${service_pedido}/primera_fecha`);
    const primeraFecha = response.data;
    
    if (!primeraFecha || (!primeraFecha.mes_anio && !primeraFecha.anio_mes)) {
      return res.status(404).json({ message: "No hay información de la primera fecha disponible" });
    }
    
    res.status(200).json({
      primeraFecha,
      mensaje: `La primera fecha de registro de pedidos fue en ${primeraFecha.mes_anio}`
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getInformePedidos = async (req, res) => {
  try {
    const { mesAnio } = req.params;
    
    // Realiza todas las peticiones en paralelo usando Promise.all
    const [
      reporteDiasResponse,
      reporteTotalMesResponse,
      reporteDiasClienteResponse,
      reporteTotalMesClienteResponse
    ] = await Promise.all([
      axios.get(`${service_pedido}/ventas_diarias/${mesAnio}`),
      axios.get(`${service_pedido}/ventas_totales/${mesAnio}`),
      axios.get(`${service_cliente}/usuarios_por_dia/${mesAnio}`),
      axios.get(`${service_cliente}/usuarios_totales/${mesAnio}`)
    ]);

    // Extrae los datos de cada respuesta
    const reporteDias = reporteDiasResponse.data;
    const reporteTotalMes = reporteTotalMesResponse.data;
    const reporteDiasCliente = reporteDiasClienteResponse.data;
    const reporteTotalMesCliente = reporteTotalMesClienteResponse.data;

    // Construye el objeto de respuesta con todos los datos
    const informe = {
      ventas: {
        por_dia: reporteDias,
        total_mes: reporteTotalMes
      },
      usuarios: {
        por_dia: reporteDiasCliente,
        total_mes: reporteTotalMesCliente
      },
      periodo: mesAnio
    };

    // Envía la respuesta
    res.status(200).json(informe);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const UpdateAlmacenPedidosControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(
      `${service_pedido}/pedido_almacen/${id}`,
      req.body
    );
    if (response) {
      //await redisClient.del('pedidos_cache');
      res.status(201).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error creating order");
  }
};

export const UpdatePedidoConductorEstadoControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(
      `${service_pedido}/pedido_estado/${id}`,
      req.body
    );

    if (response.status === 200 && response.data) {
      return res.status(200).json(response.data);
    }

    return res
      .status(404)
      .json({ message: "Pedido no encontrado o no actualizado" });
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 404) {
        return res
          .status(404)
          .json({ message: "Pedido no encontrado", details: data });
      }
    }

    console.error(
      `Error en UpdatePedidoConductorEstadoControllerGW: ${error.message}`
    );
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const UpdatePedidoCanceladosControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(
      `${service_pedido}/pedido_anulado/${id}`,
      req.body
    );

    if (response.status === 200 && response.data) {
      return res.status(200).json(response.data);
    }

    return res
      .status(404)
      .json({ message: "Pedido no encontrado o no actualizado" });
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 404) {
        return res
          .status(404)
          .json({ message: "Pedido no encontrado", details: data });
      }
    }

    console.error(
      `Error en UpdatePedidoCanceladosControllerGW: ${error.message}`
    );
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const UpdatePedidoRotacionControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(
      `${service_pedido}/pedido_rotacion/${id}`,
      req.body
    );

    if (response.status === 200 && response.data) {
      return res.status(200).json(response.data);
    }

    return res
      .status(404)
      .json({ message: "Pedido no rotado manualmente" });
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 404) {
        return res
          .status(404)
          .json({ message: "Pedido no encontrado durante rotacion", details: data });
      }
    }

    console.error(
      `Error en UpdatePedidoRotacionControllerGW: ${error.message}`
    );
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const UpdatePedidoDistribuidorAlmacenControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(
      `${service_pedido}/pedido_distribuidor_almacen/${id}`,
      req.body
    );

    if (response.status === 200 && response.data) {
      return res.status(200).json(response.data);
    }

    return res
      .status(404)
      .json({ message: "Pedido no encontrado" });
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 404) {
        return res
          .status(404)
          .json({ message: "Pedido no encontrado", details: data });
      }
    }

    console.error(
      `Error en UpdatePedidoDistribuidorAlmacenControllerGW: ${error.message}`
    );
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getPedidoClienteControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${service_pedido}/pedido_history_cliente/${id}`);

    if (response && response.data) {
      const transformedData = await Promise.all(response.data.map(async (pedido) => {
        // Separar detalles en productos y promociones (solo ID y foto)
        const fotos = [];

        // Procesar detalles en paralelo
        await Promise.all(pedido.detalles.map(async (detalle) => {
          try {
            if (detalle.promocion_id === null) {
              // Obtener solo ID y foto del producto
              const productoResponse = await axios.get(`${service_producto}/producto/${detalle.producto_id}`);
              if (productoResponse.data.foto.length > 0) {
                fotos.push(productoResponse.data.foto[0]);
              }
            } else {
              // Obtener solo ID y foto de la promoción
              const promocionResponse = await axios.get(`${service_producto}/promocion/${detalle.promocion_id}`);
              if (promocionResponse.data.foto.length > 0) {
                fotos.push(promocionResponse.data.foto[0]);
              }
            }
          } catch (error) {
            console.error(`Error obteniendo detalle: ${error.message}`);
          }
        }));

        // Obtener solo direccion de la ubicación
        let direccion = "";
        try {
          const ubicacionResponse = await axios.get(`${service_ubicacion}/ubicacion/${pedido.ubicacion_id}`);
          direccion = ubicacionResponse.data.direccion || "";
        } catch (error) {
          console.error(`Error obteniendo ubicación: ${error.message}`);
        }

        // Crear objeto final simplificado
        return {
          pedido_id: pedido.pedido_id,
          cliente_id: pedido.cliente_id,
          fecha: pedido.fecha,
          estado: pedido.estado,
          total: pedido.total,
          fotos, // Array de strings con las fotos
          direccion
        };
      }));

      res.status(200).json(transformedData);
    } else {
      res.status(404).json({ error: 'No se encontraron datos para el cliente indicado.' });
    }
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: `Microservicio error: ${error.response.statusText}`,
        status: error.response.status
      });
    } else {
      res.status(500).json({ error: `Error en la solicitud: ${error.message}` });
    }
  }
};


export const verificarCodigoControllerGW = async (req, res) => {
    try {
        const { codigo } = req.query;

        if (!codigo) {
            return res.status(400).json({ message: "Parámetro 'codigo' es requerido" });
        }

        const microservicioURL = `${service_pedido}/codigo_pedido?codigo=${codigo}`;
        const respuesta = await axios.get(microservicioURL);

        res.status(respuesta.status).json(respuesta.data);

    } catch (error) {
        if (error.response) {
            const status = error.response.status;

            if (status === 404) {
                return res.status(404).json({ 
                    error: "Código de descuento no encontrado",
                    detalles: error.response.data.message || null
                });
            }

            return res.status(status).json({
                error: error.response.data.error || "Error desde el microservicio pedido",
                detalles: error.response.data
            });
        }

        return res.status(500).json({ error: 'Error al conectar con el microservicio' });
    }
};


export const getDeliveryPedidosControllerGW = async (req, res) => {
  try {
    const response = await axios.get(`${service_pedido}/delivery_pedido`);

    // Verificamos si response.data existe y tiene elementos
    if (response && response.data && response.data.length > 0) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ error: 'No se encontraron datos en delivery.' });
    }

  } catch (error) {
    res.status(500).json({ error: `Error en la solicitud: ${error.message}` });
  }
};
