import {getNovedadesGw} from '../controllers/gw_novedades_controller.js'
import express from 'express'

const routerGWNovedades = express.Router()

routerGWNovedades.get('/apigw/v1/novedad',getNovedadesGw)

export default routerGWNovedades