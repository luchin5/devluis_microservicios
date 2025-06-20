import express from 'express';
import cors from 'cors';
import morgan from 'morgan';  // Importa Morgan


import dotenv from 'dotenv';

// Configurar dotenv con la ruta al archivo .env en la raíz del proyecto
dotenv.config();
// IMPORT ROUTES
import routerLogin from "./routes/login_route.js";

const app_micro_login = express()

const PORT = process.env.PORT_AUTH

app_micro_login.use(cors())
app_micro_login.use(morgan('combined'))
app_micro_login.use(express.json())

app_micro_login.use('/api/v1',routerLogin)

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

app_micro_login.listen(PORT,()=>{
    console.log(`Microservice LOGIN running http://localhost:${PORT}`)
})

export {app_micro_login}