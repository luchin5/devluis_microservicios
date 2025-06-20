
import { getCodigoDescuentoController,verificarCodigoController,getDeliverysTiposById,getDeliverysTipos,getPrimeraFechaPedido,getVentasDiariasMes,getVentasTotalesMes,updatePedidoDistribuidores,updatePedidoRotacionesManual,getPedidosDistribuidoresResumen,getConteoTotalDistribuidoresPedidos,getConteoTotalPedidosDistribuidor,getPedidosEntregadosDistribuidores,getPedidosPendientesDistribuidor,getPedidosEnProcesoDistribuidores,getPedidosDistribuidor,getPedidoTotalesCentral,getPedidoCentralPendientes,getPedidoCentralEnProcesos,getPedidoCentralEntregados,getPedidoConductorControllerId,updatePedidoCancelados,updatePedidoConductoresEstado,updatePedidoConductores,updatePedidoPrecios,updatePedidoAlmacenController,getDetallePedidosAll,deletePedidoDetalleController,updatePedidoDetallesController,postDetallePedidos,getDetallePedidosId,getPedidosSinConductores,getPedidosConductorInfos,getPedidosConteos,getDetallePedidos,getPedidoController, postPedidoController,updatePedidoController,deletePedidoController,getPedidoControllerId, getPedidoHistoryConductores, getPedidosAlmacenControllerID,getPedidoClienteHistorialesId } from "../controllers/pedido_controller.js";


import express from 'express'

const routerPedido = express.Router()
//TABLA PEDIDO

routerPedido.get('/pedido/almacen/:idalmacen/:estado',getPedidosAlmacenControllerID)
routerPedido.get('/pedido',getPedidoController)
routerPedido.get('/pedido/:id',getPedidoControllerId)
//PEDIDO QUE VERIFICA EL ID DEL CODNCUTOR CON EL PEDIDO
routerPedido.get('/pedido_cond/:id',getPedidoConductorControllerId)
routerPedido.post('/pedido',postPedidoController)
routerPedido.put('/pedido/:id',updatePedidoController)
routerPedido.delete('/pedido/:id',deletePedidoController)
//TABLA DETALLE PEDIDO
routerPedido.get('/det_pedido',getDetallePedidos)
routerPedido.get('/det_pedido/:id',getDetallePedidosId)
routerPedido.post('/det_pedido',postDetallePedidos)
routerPedido.put('/det_pedido/:id',updatePedidoDetallesController)
routerPedido.delete('/det_pedido/:id',deletePedidoDetalleController)
//ENPOINTS PARA LAS NECESIDADES ACTUALES
routerPedido.get('/allpedidodetalle/:id',getDetallePedidosAll)
//CONTEO DE PEDIDOS
 // DASHBOARD : conteo de pedidos
routerPedido.get('/pedido_conteo/:id',getPedidosConteos)
//DASHBOARD: ULTIMO PEDIDO
routerPedido.get('/pedido_conductor/:id',getPedidosConductorInfos)
//All Pedidos sin Conductor
routerPedido.get('/pedido_sin_conductor',getPedidosSinConductores)
//Pedidos de Almacen 
//routerPedido.get('/pedido_almacen/:id_almacen',getPedidosAlmacen)
//ACTUALIZACION DEL ALMACEN POR CADA PEDIDO
routerPedido.put('/pedido_almacen/:id',updatePedidoAlmacenController)
routerPedido.put('/pedido_precio/:id',updatePedidoPrecios)
//PEDIDO ACTUALIZADO
routerPedido.put('/pedido_conductor/:id',updatePedidoConductores)
//ENDPOINT PARA ACTUALIZAR TODOS LOS PEDIDOS CON SU RESPECTIVO ALMACEN Y PEDIDOS
routerPedido.put('/pedido_estado/:id',updatePedidoConductoresEstado)
//ENDPOINT PARA TRAER TODOS LOS PEDIDOS EN T
routerPedido.get('/pedido_history/:id/:fecha',getPedidoHistoryConductores)
routerPedido.get('/pedido_pendientes',getPedidoCentralPendientes)
routerPedido.get('/pedido_enproceso',getPedidoCentralEnProcesos)
routerPedido.get('/pedido_entregado',getPedidoCentralEntregados)
routerPedido.get('/pedido_distribuidores/:id',getPedidosDistribuidor)
//ENDPOINT DE PEDIDOS TOTALES POR SEMANA
routerPedido.get('/pedido_semanal',getPedidoTotalesCentral)
//ENDPOINT QUE SIRVE PARA RECHAZAR UN PEDIDO
routerPedido.put('/pedido_anulado/:id',updatePedidoCancelados)
//ROTACION MANUAL IMPLEMENTACION
routerPedido.put('/pedido_rotacion/:id',updatePedidoRotacionesManual)
routerPedido.put('/pedido_distribuidor_almacen/:id',updatePedidoDistribuidores)
//LISTADO DE PEDIDOS PENDIENTES DISTRIBUIDOR
routerPedido.get('/pedido_distribuidor_enproceso',getPedidosEnProcesoDistribuidores)
routerPedido.get('/pedido_distribuidor_pendiente',getPedidosPendientesDistribuidor)
routerPedido.get('/pedido_distribuidor_entregado',getPedidosEntregadosDistribuidores)
routerPedido.get('/pedido_distribuidor_total',getConteoTotalPedidosDistribuidor)
routerPedido.get('/pedido_distribuidor_conteo/:fecha',getConteoTotalDistribuidoresPedidos)
routerPedido.get('/pedido_distribuidor_conteo_pedidos/:fecha/:id',getPedidosDistribuidoresResumen)
routerPedido.get('/ventas_diarias/:mesAnio', getVentasDiariasMes);
routerPedido.get('/ventas_totales/:mesAnio', getVentasTotalesMes);
routerPedido.get('/primera_fecha', getPrimeraFechaPedido);
//ENDPOINT DE LISTADO DE PEDIDOS QUE REALIZO UN CLIENTE
routerPedido.get('/pedido_history_cliente/:id', getPedidoClienteHistorialesId);
//ENDOINT PARA TRAER LOS TIPOS DE DELIVERY
routerPedido.get('/delivery_pedido', getDeliverysTipos);
//ENDPONT PARA TRAER UN DETERMINADO ID DE DELIVERY
routerPedido.get('/delivery_pedido/:id', getDeliverysTiposById);
//ENDPOINT PARA VERIFICAR EL CODIGO DE UN PEDIDO
routerPedido.get('/codigo_pedido', verificarCodigoController);
//ENDPOINT PARA SACAR UN PEDIDO EN ESPECIFICO
routerPedido.get('/codigo_descuento/:id', getCodigoDescuentoController);



export default routerPedido