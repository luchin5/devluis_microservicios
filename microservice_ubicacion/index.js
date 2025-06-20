import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routerUbicacion from "./routes/ubicacion_route.js";

const app_micro_ubicacion = express()

const PORT = process.env.PORT_UBI

app_micro_ubicacion.use(cors())
app_micro_ubicacion.use(morgan('combined'))
app_micro_ubicacion.use(express.json())

app_micro_ubicacion.use('/api/v1',routerUbicacion)


app_micro_ubicacion.listen(PORT,()=>{
    console.log(`Microservice UBICACION running http://localhost:${PORT}`)
})

export {app_micro_ubicacion}