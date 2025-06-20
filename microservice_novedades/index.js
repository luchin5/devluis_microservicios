import express from "express";
import cors from 'cors';
import morgan from "morgan";

import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routerNovedad from "./routes/novedades_routes.js";

const app_micro_novedad = express()

const PORT = process.env.PORT_NOV

app_micro_novedad.use(cors())
app_micro_novedad.use(morgan('combined'))
app_micro_novedad.use(express.json())

app_micro_novedad.use('/api/v1',routerNovedad)

app_micro_novedad.listen(PORT,()=>{
    console.log(`Microservice NOVEDADES running http://localhost:${PORT}`)
})

export {app_micro_novedad}