import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv'
dotenv.config()

// IMPORT ROUTES
import routerZonaProducto from "./routes/zona_producto_route.js";

const app_micro_zona_producto = express()

const PORT = process.env.PORT_ZONAPRODUCTO

app_micro_zona_producto.use(cors())
app_micro_zona_producto.use(morgan('combined'))
app_micro_zona_producto.use(express.json())

app_micro_zona_producto.use('/api/v1',routerZonaProducto)

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

app_micro_zona_producto.listen(PORT,()=>{
    console.log(`Microservice ZONA PRODUCTO running http://localhost:${PORT}`)
})

export {app_micro_zona_producto}