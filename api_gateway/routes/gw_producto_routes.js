import {productosPromocionesSeleccionadasControllerGW,añadirProductosPromocionesControllerGW} from '../controllers/gw_producto_controller.js'
import express from 'express'

const routerGWProducto = express.Router()

routerGWProducto.get('/apigw/v1/producto_promocion_agregar',añadirProductosPromocionesControllerGW)
routerGWProducto.post('/apigw/v1/producto_promocion',productosPromocionesSeleccionadasControllerGW)

export default routerGWProducto