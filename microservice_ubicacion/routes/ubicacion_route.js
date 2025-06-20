import {getDistritosClienteController,getDepartamentosCliente,AllUbicacionCliente,actualizarUltimaUbicacionCliente,getUltimaUbicacionesCliente,createUbicacionesCliente,getZonasId,getAllUbicaciones,getUbicacionesId,createUbicacion,updateRelacionesUbicaciones,deleteUbicaciones,createZonas,getZonas,updateZonas,deleteZonas} from '../controllers/ubicacion_controller.js'
import express from 'express'

const routerUbicacion= express.Router();
//TABLA UBICACIONES
routerUbicacion.get('/ubicacion',getAllUbicaciones)
routerUbicacion.get('/ubicacion/:id',getUbicacionesId)
routerUbicacion.post('/ubicacion',createUbicacion)
routerUbicacion.put('/ubicacion/:id',updateRelacionesUbicaciones)
routerUbicacion.delete('/ubicacion/:id',deleteUbicaciones)
//TABLA ZONA_TRABAJO
routerUbicacion.get('/zona',getZonas)
routerUbicacion.get('/zona/:id',getZonasId)
routerUbicacion.post('/zona',createZonas)
routerUbicacion.put('/zona/:id',updateZonas)
routerUbicacion.delete('/zona/:id',deleteZonas)
//POST PARA QUE EL CLIENTE REGISTRE SUS UBICACIONES
routerUbicacion.post('/ubicacion_cliente',createUbicacionesCliente)
//OBTENER LA ULTIMA UBICACION SELECCIONADA DEL CLIENTE
routerUbicacion.get('/ultima_ubicacion/:id',getUltimaUbicacionesCliente)
//ACTUALIZAR LA UBICACION QUE ELIGIÓ EL CLIENTE
routerUbicacion.put('/actualizar_ubicacion/:id',actualizarUltimaUbicacionCliente)
//OBTENER TODAS LAS DIRECCIONES DE UN DETERMINADO CLIENTE
routerUbicacion.get('/all_ubicacion/:cliente',AllUbicacionCliente)
//OBTENER TODOS LOS DEPARTAMENTOS DISPONIBLES
routerUbicacion.get('/departamentos',getDepartamentosCliente)
//OBTENER LOS DISTRITOS DE UN DETERMINADO DEPARTAMENTOS
routerUbicacion.get('/distritos/:id',getDistritosClienteController)

export default routerUbicacion
