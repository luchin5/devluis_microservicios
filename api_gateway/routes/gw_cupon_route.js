import {getCuponGW} from '../controllers/gw_cupon_controller.js'
import express from 'express'

const routerGWCodigo = express.Router()

routerGWCodigo.get('/apigw/v1/cupon',getCuponGW)

export default routerGWCodigo