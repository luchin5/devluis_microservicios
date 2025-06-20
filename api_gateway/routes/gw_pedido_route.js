
import { getDeliveryPedidosControllerGW,verificarCodigoControllerGW,getPedidoClienteControllerGW,getInformePedidos,getPedidosPrimeraFecha,UpdatePedidoDistribuidorAlmacenControllerGW,UpdatePedidoRotacionControllerGW,getPedidosInfoDetalles,getDistribudoresConteoControllerGW,getDistribuidorConteoTotalControllerGW,getDistribuidorTotalControllerGW,getEntregadosControllerGW,getPendienteControllerGW,getEnprocesoControllerGW,getPedidoSemanalGW,getPedidoPendientesControllerGW,getEnProcesoControllerGW,getPedidoEntregadosControllerGW,getPedidoCondControllerGW,UpdatePedidoCanceladosControllerGW,UpdatePedidoConductorEstadoControllerGW,postInfoPedido,UpdateAlmacenPedidosControllerGW,getPedidosControllerGW, getPedidoHistoryConductorControllerGW, getPedidoAlmacenControllerGW} from '../controllers/gw_pedido_controllers.js'


import express from 'express'

const routerGWPedido = express.Router()

routerGWPedido.get('/apigw/v1/pedido/almacen/:idalmacen/:estado',getPedidoAlmacenControllerGW)
routerGWPedido.get('/apigw/v1/pedido',getPedidosControllerGW)
//ENDPOINT PARA LA CENTRAL
routerGWPedido.get('/apigw/v1/pedido_pendiente',getPedidoPendientesControllerGW)
routerGWPedido.get('/apigw/v1/pedido_enproceso',getEnProcesoControllerGW)
routerGWPedido.get('/apigw/v1/pedido_entregado',getPedidoEntregadosControllerGW)
//ENDPOINT TOTAL DE DINERO POR SEMANA CENTRAL
routerGWPedido.get('/apigw/v1/pedido_semanal',getPedidoSemanalGW)
//ENDPOINT PARA TRAER EL ID DEL CONDUCTOR CON EL ID DEL PEDIDO
routerGWPedido.get('/apigw/v1/pedido_cond/:id',getPedidoCondControllerGW)
routerGWPedido.post('/apigw/v1/pedido',postInfoPedido)
routerGWPedido.put('/apigw/v1/pedido/:id',UpdateAlmacenPedidosControllerGW)
routerGWPedido.put('/apigw/v1/pedido_estado/:id',UpdatePedidoConductorEstadoControllerGW)
routerGWPedido.get('/apigw/v1/pedido_history/:id/:fecha',getPedidoHistoryConductorControllerGW)
routerGWPedido.put('/apigw/v1/pedido_anulado/:id',UpdatePedidoCanceladosControllerGW)
//ROTACION MANUAL ALMACENERO
routerGWPedido.put('/apigw/v1/pedido_rotado/:id',UpdatePedidoRotacionControllerGW)
routerGWPedido.put('/apigw/v1/pedido_distribuidor_almacen/:id',UpdatePedidoDistribuidorAlmacenControllerGW)
//ENDPOINT PARA LOS ALMACENEROS
routerGWPedido.get('/apigw/v1/pedido_distribuidor_enproceso',getEnprocesoControllerGW)
routerGWPedido.get('/apigw/v1/pedido_distribuidor_pendiente',getPendienteControllerGW)
routerGWPedido.get('/apigw/v1/pedido_distribuidor_entregado',getEntregadosControllerGW)
routerGWPedido.get('/apigw/v1/pedido_distribuidor_total',getDistribuidorTotalControllerGW)
routerGWPedido.get('/apigw/v1/pedido_distribuidor_conteo/:fecha',getDistribuidorConteoTotalControllerGW)
routerGWPedido.get('/apigw/v1/pedido_distribuidor_conteo_pedidos/:fecha/:id',getDistribudoresConteoControllerGW)
routerGWPedido.get('/apigw/v1/pedido_distribuidor_detalles/:id',getPedidosInfoDetalles)
//INFORMES DE CENTRAL
routerGWPedido.get('/apigw/v1/fecha_primerPedido',getPedidosPrimeraFecha)
routerGWPedido.get('/apigw/v1/informe_mes_distribuidor/:mesAnio',getInformePedidos)
//INFORMACION DE UN PEDIDO EN ESPECIFICO
routerGWPedido.get('/apigw/v1/pedido_history_cliente/:id',getPedidoClienteControllerGW)
//VERIFICACION DE CODIGO
routerGWPedido.get('/apigw/v1/verificar_codigo',verificarCodigoControllerGW)
//ENDPOINT TRAE TODOS LOS DELIVERY DE LOS PEDIDOS
routerGWPedido.get('/apigw/v1/delivery_pedidos',getDeliveryPedidosControllerGW)

export default routerGWPedido  