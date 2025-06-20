import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv';

dotenv.config();
// IMPORT ROUTES
import routerAlmacen from "./routes/almacen_routes.js";

const app_micro_almacen = express()

const PORT = process.env.PORT_ALMACEN

app_micro_almacen.use(cors())
app_micro_almacen.use(morgan('combined'))
app_micro_almacen.use(express.json())

app_micro_almacen.use('/api/v1',routerAlmacen)

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

app_micro_almacen.listen(PORT,()=>{
    console.log(`Microservice ALMACEN running http://localhost:${PORT}`)
})

export {app_micro_almacen}