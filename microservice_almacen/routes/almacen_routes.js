import {getAlmacenController,getAlmacenControllerId,postAlmacenController,putAlmacenController,deleteAlmacenController } from '../controllers/almacen_controller.js'
import express from 'express'

const routerAlmacen = express.Router()

routerAlmacen.get('/almacen',getAlmacenController)
routerAlmacen.get('/almacen/:id',getAlmacenControllerId)
routerAlmacen.post('/almacen',postAlmacenController)
routerAlmacen.put('/almacen/:id',putAlmacenController)
routerAlmacen.delete('/almacen/:id',deleteAlmacenController)

export default routerAlmacen