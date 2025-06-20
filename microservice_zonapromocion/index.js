import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routerZonaPromocion from "./routes/zona_promocion_route.js";

const app_micro_zona_promocion = express()

const PORT = process.env.PORT_ZONAPROMOCION

app_micro_zona_promocion.use(cors())
app_micro_zona_promocion.use(morgan('combined'))
app_micro_zona_promocion.use(express.json())

app_micro_zona_promocion.use('/api/v1',routerZonaPromocion)

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

app_micro_zona_promocion.listen(PORT,()=>{
    console.log(`Microservice ZONA PROMOCION running http://localhost:${PORT}`)
})

export {app_micro_zona_promocion}