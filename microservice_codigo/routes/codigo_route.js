import {getCuponPedidoController,getCodigoController,getCodigosTipoController} from '../controllers/codigo_controller.js'
import express from 'express'

const routerCodigo = express.Router()

routerCodigo.get('/codigo',getCodigoController)
routerCodigo.get('/codigo_tipo',getCodigosTipoController)
routerCodigo.get('/cupon/:id',getCuponPedidoController)

export default routerCodigo