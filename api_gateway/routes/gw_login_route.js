import {getUserFirebaseGW,putPhoneFirebaseGW,postUserClienteControllerGW, putOrPostUserClienteControllerGW,postLoginController, postNewUserCLienteControllerGW, postNewUserConductorControllerGW, postUserExistController } from '../controllers/gw_login_controller.js'
import express from 'express'

const routerGWLogin = express.Router()

routerGWLogin.post('/apigw/v1/login',postLoginController)
routerGWLogin.post('/apigw/v1/user',postUserExistController)
routerGWLogin.post('/apigw/v1/register_conductor',postNewUserConductorControllerGW)
routerGWLogin.post('/apigw/v1/register_cliente',postNewUserCLienteControllerGW) // modificando...
routerGWLogin.put('/apigw/v1/register_micro_cliente',putOrPostUserClienteControllerGW)
//POST PARA EL FORMULARIO
routerGWLogin.post('/apigw/v1/cliente_registro', postUserClienteControllerGW);
routerGWLogin.get('/apigw/v1/userfirebase/:firebaseUID',getUserFirebaseGW)
routerGWLogin.put('/apigw/v1/userfirebase_phone/:firebaseUID',putPhoneFirebaseGW)


export default routerGWLogin