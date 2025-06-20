import {getNovedadController} from '../controllers/novedades_controller.js'
import express from 'express'

const routerNovedad = express.Router()

routerNovedad.get('/novedad',getNovedadController)

export default routerNovedad