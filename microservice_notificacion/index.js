import express from "express";
import cors from 'cors';
import morgan from "morgan";
import { Server } from 'socket.io';
import http from 'http'; 
import routerNotificacion from './routes/notificacion_route.js'
import dotenv from 'dotenv'
dotenv.config()

const app_micro_notificacion = express()
const server = http.createServer(app_micro_notificacion); // 👈 Crear servidor HTTP
const PORT = process.env.PORT_NOTIFY

const io = new Server(server, {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 2000,
    transports: ['websocket', 'polling']
});

app_micro_notificacion.use(cors())
app_micro_notificacion.use(morgan('combined'))
app_micro_notificacion.use(express.json())

app_micro_notificacion.use('/api/v1',routerNotificacion)

server.listen(PORT,()=>{
    console.log(`Microservice NOTIFICACION running http://localhost:${PORT}`)
})

export {app_micro_notificacion, io, server}
