import { postInfoPedido} from '../controllers/gw_almacen_zona_trabajo.js'
import express from 'express'

const routerGWAlmacenZona = express.Router()

routerGWAlmacenZona.post('/apigw/v1/pedidoAlmacenZona',postInfoPedido)
//routerGWAlmacenZona.post('/apigw/v1/almacenZona',getAlmacenZona)

export default routerGWAlmacenZona