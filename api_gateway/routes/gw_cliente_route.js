import {getSoporteTecnico,getLibroReclamaciones, actualizarPerfilClienteControllerGW,postLibroReclamacionesGW,postSoporteControllerGW,getClientesControllerGW,putClienteCalificationControllerGw, getClientesControllerIdGW, postClienteControllerGW, putClienteControllerGW,deleteClienteControllerGW,postValoracionControllerGW,getPerfilCliente } from '../controllers/gw_cliente_controllers.js'
import express from 'express'

const routerGWCliente = express.Router()

routerGWCliente.get('/apigw/v1/cliente',getClientesControllerGW)
routerGWCliente.get('/apigw/v1/cliente/:id',getClientesControllerIdGW)
routerGWCliente.post('/apigw/v1/cliente',postClienteControllerGW)
routerGWCliente.put('/apigw/v1/cliente/:id',putClienteControllerGW)
routerGWCliente.put('/apigw/v1/cliente_calificar/:id',putClienteCalificationControllerGw)
routerGWCliente.delete('/apigw/v1/cliente/:id',deleteClienteControllerGW)
//ENDPOINT QUE ME PERMITE INGRESAR UNA CALIFICACION COMO CLIENTE
routerGWCliente.post('/apigw/v1/calificacion',postValoracionControllerGW)
//ENDPOINT QUE ME PERMITE VISUALIZAR LA INFORMACION DEL CLIENTE
routerGWCliente.get('/apigw/v1/perfil_cliente/:id',getPerfilCliente)
//ENDPOINT PARA REGISTRAR EN SOPORTE TECNICO
routerGWCliente.post('/apigw/v1/soporte_tecnico',postSoporteControllerGW)
//ENDPONT PARA REGISTRAR EN EL LIBRO DE RECLAMACIONES
routerGWCliente.post('/apigw/v1/libro_reclamaciones',postLibroReclamacionesGW)
//ENDPOINT PARA ACTUALIZAR EL PERFIL DEL CLIENTE
routerGWCliente.put('/apigw/v1/actualizar_cliente/:id',actualizarPerfilClienteControllerGW)
//ENDPOINT PARA TRAER TODAS LAS RECLAMACIONES
routerGWCliente.get('/apigw/v1/libro_reclamaciones',getLibroReclamaciones)
//ENDPOINT PARA TRAER TODOS LOS REGISTROS DE SOPORTE TECNICO
routerGWCliente.get('/apigw/v1/soporte_tecnico',getSoporteTecnico)

export default routerGWCliente