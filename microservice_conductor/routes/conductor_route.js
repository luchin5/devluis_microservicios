import {getDistribuidoresAlmacen,getEventoConductoresPorId,getConductorController_Id,getConductorControllerId,getAllUsersConductores, createUserConductores, updateUserConductores, deleteUserConductores, getAllEventos, updateEventosConductores,getEventoConductorEspecificos} from '../controllers/conductor_controller.js'
import express from 'express';

const routerConductor = express.Router();

routerConductor.get('/conductor', getAllUsersConductores)
routerConductor.get('/conductor/:id',getConductorControllerId)
routerConductor.get('/conductor_user/:id',getConductorController_Id)
routerConductor.post('/conductor',createUserConductores)
routerConductor.put('/conductor/:id',updateUserConductores)
routerConductor.put('/conductor_evento/:id',updateEventosConductores)
routerConductor.delete('/conductor/:id',deleteUserConductores)
routerConductor.get(`/eventos`,getAllEventos)
routerConductor.get(`/eventos/:id`,getEventoConductoresPorId)
routerConductor.get(`/conductor_evento/:id`,getEventoConductorEspecificos)
routerConductor.get(`/distribuidor_almacen/:id`,getDistribuidoresAlmacen)

export default routerConductor;