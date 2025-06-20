import  {getPublicidadControllerGW} from '../controllers/gw_publicidad_controller.js'
import express from 'express'

const routerGWPublicidad = express.Router()

//ENDPOINT QUE TRAE LA PUBLICIDAD EN UNA DETERMINADA FECHA
routerGWPublicidad.get('/apigw/v1/publicidad',getPublicidadControllerGW)

export default routerGWPublicidad