import {getNotificacionAlmacenGW,postNotificacionAlmacenGW,getNotificacionClienteGW,postNotificacionClienteGW} from '../controllers/gw_notificacion_controller.js'
import express from 'express'

const routerGWNotificacion = express.Router()

routerGWNotificacion.get('/apigw/v1/notificacion/:fecha/:id',getNotificacionAlmacenGW)
routerGWNotificacion.post('/apigw/v1/notificacion',postNotificacionAlmacenGW)
routerGWNotificacion.get('/apigw/v1/notificacion_cliente',getNotificacionClienteGW)
routerGWNotificacion.post('/apigw/v1/notificacion_cliente',postNotificacionClienteGW)

export default routerGWNotificacion