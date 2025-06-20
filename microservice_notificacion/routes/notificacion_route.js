import { createNotificacionesClientes,getAllNotificacionesClientes,getAllNotificacionesAlmacenes,createNotificacionesAlmacenes } from '../controllers/notificacion_controller.js';
import express from 'express';

const routerNotificacion = express.Router();
routerNotificacion.get('/notificacion/:fecha/:id',getAllNotificacionesAlmacenes)
routerNotificacion.post('/notificacion',createNotificacionesAlmacenes)
routerNotificacion.get('/notificacion_cliente/:fecha',getAllNotificacionesClientes)
routerNotificacion.post('/notificacion_cliente',createNotificacionesClientes)

export default routerNotificacion;