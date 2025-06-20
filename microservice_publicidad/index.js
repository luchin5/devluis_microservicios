import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routePublicidad from "./routes/publicidad_route.js";

const app_micro_publicidad = express()

const PORT = process.env.PORT_PUBLI

app_micro_publicidad.use(cors())
app_micro_publicidad.use(morgan('combined'))
app_micro_publicidad.use(express.json())

app_micro_publicidad.use('/api/v1',routePublicidad)


app_micro_publicidad.listen(PORT,()=>{
    console.log(`Microservice PUBLICIDAD running http://localhost:${PORT}`)
})

export {app_micro_publicidad}