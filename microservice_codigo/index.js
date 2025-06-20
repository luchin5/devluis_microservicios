import express from "express";
import cors from 'cors';
import morgan from "morgan";

import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routerCodigo from "./routes/codigo_route.js";

const app_micro_codigo = express()

const PORT = process.env.PORT_CODIGO

app_micro_codigo.use(cors())
app_micro_codigo.use(morgan('combined'))
app_micro_codigo.use(express.json())

app_micro_codigo.use('/api/v1',routerCodigo)

app_micro_codigo.listen(PORT,()=>{
    console.log(`Microservice CODIGO running http://localhost:${PORT}`)
})

export {app_micro_codigo}