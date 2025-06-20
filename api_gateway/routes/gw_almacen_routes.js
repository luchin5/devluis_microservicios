import { getAlmacenControllerGW,getAlmacenControllerIdGW,postAlmacenControllerGW,putClienteControllerGW,deleteClienteControllerGW} from '../controllers/gw_almacen_controllers.js'
import express from 'express'

const routerGWAlmacen = express.Router()

routerGWAlmacen.get('/apigw/v1/almacen',getAlmacenControllerGW)
routerGWAlmacen.get('/apigw/v1/almacen/:id',getAlmacenControllerIdGW)
routerGWAlmacen.post('/apigw/v1/almacen',postAlmacenControllerGW)
routerGWAlmacen.put('/apigw/v1/almacen/:id',putClienteControllerGW)
routerGWAlmacen.delete('/apigw/v1/almacen/:id',deleteClienteControllerGW)

export default routerGWAlmacen