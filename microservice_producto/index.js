import express from "express";
import cors from 'cors';
import morgan from "morgan";
import dotenv from 'dotenv'
dotenv.config()
// IMPORT ROUTES
import routerProducto from "./routes/producto_route.js";

const app_micro_producto = express()

const PORT = process.env.PORT_PRODUCTO

app_micro_producto.use(cors())
app_micro_producto.use(morgan('combined'))
app_micro_producto.use(express.json())

app_micro_producto.use('/api/v1',routerProducto)

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

app_micro_producto.listen(PORT,()=>{
    console.log(`Microservice PRODUCTO running http://localhost:${PORT}`)
})

export {app_micro_producto}