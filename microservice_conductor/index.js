import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv'
import routerConductor from "./routes/conductor_route.js";

dotenv.config()

const app_micro_conductor = express()

const PORT = process.env.PORT_CONDUC

app_micro_conductor.use(cors())
app_micro_conductor.use(morgan('combined'))
app_micro_conductor.use(express.json())

app_micro_conductor.use('/api/v1',routerConductor)

// MANEJO DE ERRORES
/*app_micro_pedido.use('/api', (req, res) => {
    //console.log("---no esta esa ruta")
    res.status(404).json({ error: 'Ruta no encontrada' });

});
// Manejo de errores
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: 'Error interno del servidor' });
}*/

app_micro_conductor.listen(PORT,()=>{
    console.log(`Microservice CONDUCTOR running http://localhost:${PORT}`)
})

export {app_micro_conductor}
