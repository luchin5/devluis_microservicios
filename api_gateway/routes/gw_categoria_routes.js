import  {getCategoriaSubcategoriaControllerIdGW,getCategoriasControllerGW,getCategoriaControllerIdGW,getAllProductosSubcategoriaGW,getZonaYCategoriasController} from '../controllers/gw_categoria_controller.js'
import express from 'express'

const routerGWCategoria = express.Router()

//ENDPOINT QUE TRAE TODAS LAS CATEGORIAS HASTA LA FECHA
routerGWCategoria.get('/apigw/v1/categoria',getCategoriasControllerGW)
//ENDPOINT QUE TE TRAE UNA CATEGORIA EN ESPECIFICO CON SUS DETALLES RESPECTIVOS
routerGWCategoria.get('/apigw/v1/categoria/:id?/:ubicacion_id', getCategoriaControllerIdGW);
//ENDPOINT QUE TRAE TODOS LOS PRODUCTOS Y PROMOCIONES DE UNA DETERMINADA SUBCATEGORIA
routerGWCategoria.get('/apigw/v1/all_subcategoria_productos/:subcategoria_id/:zona_trabajo_id',getAllProductosSubcategoriaGW)
//ENDPOINT QUE TRAE TODAS LAS CATEGORIAS DEPENDIENDO DE LA UBICACION SELECCIONADA POR EL CLIENTE
routerGWCategoria.get('/apigw/v1/categoria_zona/:ubicacion_id', getZonaYCategoriasController);
//ENDPOINT QUE ME TRAE TODAS LAS SUBCATEGORIAS DE UNA DETERMINADA CATEGORIA
routerGWCategoria.get('/apigw/v1/all_categorias_subcategoria/:id/:zona_trabajo_id', getCategoriaSubcategoriaControllerIdGW);

export default routerGWCategoria