import {getCantidadPromoProductos,getPromoProductosDetalles,getProductoZonaDetalles} from "../controllers/zona_producto_controller.js";
import express from 'express'

const routerZonaProducto = express.Router()

routerZonaProducto.get('/precioZonaProducto/:idzona/:idprod',getCantidadPromoProductos)
routerZonaProducto.get('/precioZonaProducto/:idprod',getPromoProductosDetalles)
routerZonaProducto.get('/precioZonaProductoDetalle/:idzona/:idprod',getProductoZonaDetalles)

export default routerZonaProducto