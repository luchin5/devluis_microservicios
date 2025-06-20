import { allDistritosControllerGW,getTemperaturaController,getCoordsByAddressControllerGW,getGoogleMapsApiKeyController,allDepartamentosControllerGW,eliminarUbicacionClienteControllerGW,getAllUbicacionesClienteControllerGW,actualizarUltimaUbicacionClienteControllerGW,getUltimaUbicacionClienteControllerGW,getUbicacionesControllerIdGW,ubicacionClienteControllerGW} from '../controllers/gw_ubicacion_controllers.js'
import express from 'express'

const routerGWUbicacion = express.Router()

routerGWUbicacion.get('/apigw/v1/ubicacion/:id',getUbicacionesControllerIdGW)
//POST NECESARIO PARA LOS CLIENTES EN LA APLICACION DE SOL VIDA
routerGWUbicacion.post('/apigw/v1/ubicacion_cliente',ubicacionClienteControllerGW)
//GET DEL PEDIDO SELECCIONADO POR EL CLIENTE EN LA APP DE SOL VIDA
routerGWUbicacion.get('/apigw/v1/ubicacion_seleccionada/:id',getUltimaUbicacionClienteControllerGW)
//PUT QUE ME SIRVE PARA ACTUALIZAR LA DATA DEL CLIENTE
routerGWUbicacion.put('/apigw/v1/actualizar_ubicacion/:id',actualizarUltimaUbicacionClienteControllerGW)
//ALL UBICACIONES DEL CLIENTE REGISTRADAS
routerGWUbicacion.get('/apigw/v1/allubicaciones/:cliente',getAllUbicacionesClienteControllerGW)
//DELETE UBICACION DEL CLIENTE REGISTRADA
routerGWUbicacion.delete('/apigw/v1/eliminar_ubicacion/:id',eliminarUbicacionClienteControllerGW)
//OBTENER TODOS LOS DEPARTAMENTOS
routerGWUbicacion.get('/apigw/v1/alldepartamentos',allDepartamentosControllerGW)
//OBTENER LA APIKEY DE GOOGLE
routerGWUbicacion.get('/apigw/v1/maps_api_key', getGoogleMapsApiKeyController);
//OBTENER COORDENADAS DESDE EL BACKEND
routerGWUbicacion.get('/apigw/v1/geocode', getCoordsByAddressControllerGW);
//GET TEMPERATURA OPEN WEATHER
routerGWUbicacion.get('/apigw/v1/temperatura', getTemperaturaController);
//OBTENER TODOS LOS DISTRITOS
routerGWUbicacion.get('/apigw/v1/alldistritos/:id',allDistritosControllerGW)


export default routerGWUbicacion