import express from "express";
import cors from 'cors';
import morgan from "morgan";

import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routerCliente from "./routes/cliente_route.js";

const app_micro_cliente = express()

const PORT = process.env.PORT_CLIENTE

app_micro_cliente.use(cors())
app_micro_cliente.use(morgan('combined'))
app_micro_cliente.use(express.json())

app_micro_cliente.use('/api/v1',routerCliente)

app_micro_cliente.listen(PORT,()=>{
    console.log(`Microservice CLIENTE running http://localhost:${PORT}`)
})

export {app_micro_cliente}