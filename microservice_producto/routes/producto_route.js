import {getProductoIdController,getCantidadPromoProductos,getProductoController, getProductoControllerId,getPromocionController,getPromocionControllerId,actualizarValoracionProducto,actualizarValoracionPromocion,getProductosYPromocionesController } from "../controllers/producto_controller.js";
import express from 'express'

const routerProducto = express.Router()
routerProducto.get('/producto',getProductoController)
routerProducto.get('/producto/:id',getProductoControllerId)

routerProducto.get('/promocion',getPromocionController)
routerProducto.get('/promocion/:id',getPromocionControllerId)

routerProducto.get('/cantidadprod/:idprom/:idprod',getCantidadPromoProductos)
//ACTUALIZAR LA VALORACIÓN PRODUCTO
routerProducto.put('/actualizar_valoracion_producto/:id',actualizarValoracionProducto)
//ACTUALIZAR LA VALORACION PROMOCION
routerProducto.put('/actualizar_valoracion_promocion/:id',actualizarValoracionPromocion)
//ENDPOINT DE SUGERENCIAS
routerProducto.get('/productos_promociones',getProductosYPromocionesController)
//ENDPOINT PARA OBTENER EL PRODUCTO_ID DE UNA DETERMINADA PROMOCION_ID
routerProducto.get('/get_producto_id/:id', getProductoIdController);

export default routerProducto