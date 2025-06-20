import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routerCategoria from "./routes/categoria_route.js";

const app_micro_categoria = express()

const PORT = process.env.PORT_CAT

app_micro_categoria.use(cors())
app_micro_categoria.use(morgan('combined'))
app_micro_categoria.use(express.json())

app_micro_categoria.use('/api/v1',routerCategoria)


app_micro_categoria.listen(PORT,()=>{
    console.log(`Microservice CATEGORIA running http://localhost:${PORT}`)
})

export {app_micro_categoria}