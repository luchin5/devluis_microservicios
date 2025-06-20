import {getZonaPromociones,getPromosDetalles,getZonaPromocionesDetalles} from "../controllers/zona_promocion_controller.js";
import express from 'express'

const routerZonaPromocion = express.Router()
routerZonaPromocion.get('/preciopromo/:idzona/:idprom',getZonaPromociones)
routerZonaPromocion.get('/preciopromo/:idpromo',getPromosDetalles)
routerZonaPromocion.get('/preciopromodetalle/:idzona/:idprom',getZonaPromocionesDetalles)

export default routerZonaPromocion