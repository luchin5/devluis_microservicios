import { getProveedoresControllerGW,getEventoConductores,getLastPedido,getConductorPedidos,getConductoresControllerIdGW, getConductoresControllerGW, postConductoresControllerGW, putConductoresControllerGW, deleteConductoresControllerGW } from '../controllers/gw_conductor_controllers.js'
import express from 'express'

const routerGWConductor = express.Router()

routerGWConductor.get('/apigw/v1/conductor',getConductoresControllerGW)
routerGWConductor.get('/apigw/v1/conductor/:id',getConductoresControllerIdGW)
routerGWConductor.post('/apigw/v1/conductor',postConductoresControllerGW)
routerGWConductor.put('/apigw/v1/conductor/:id',putConductoresControllerGW)
routerGWConductor.delete('/apigw/v1/conductor/:id',deleteConductoresControllerGW)
routerGWConductor.get('/apigw/v1/conductor_evento/:id',getEventoConductores)
routerGWConductor.get('/apigw/v1/conductor_pedidos/:idconductor',getConductorPedidos)
routerGWConductor.get('/apigw/v1/conductor_lastpedido/:idconductor',getLastPedido)
routerGWConductor.get('/apigw/v1/distribuidor',getProveedoresControllerGW)
export default routerGWConductor