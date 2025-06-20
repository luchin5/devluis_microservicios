import {getPublicidadesBanners,getPublicidadController} from '../controllers/publicidad_controller.js'
import express from 'express'

const routePublicidad = express.Router()

routePublicidad.get('/publicidad',getPublicidadController)
//BANNERS MOSTRADOS A CONSECUENCIA DE LOS EVENTO
routePublicidad.get('/publicidad_banners',getPublicidadesBanners)

export default routePublicidad
