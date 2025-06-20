import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const service_notificacion = process.env.MICRO_NOTIFICACION

export const getNotificacionAlmacenGW = async (req,res) => {
    try{
        const {fecha,id} = req.params
        const response = await axios.get(`${service_notificacion}/notificacion/${fecha}/${id}`)
        if(response && response.data){
            res.status(200).json(response.data)
        }
    }catch(error){
        if(error.response && error.response.status === 404){
            res.status(404).json({message:'Id not found'})
        }
        else{
            res.status(500).json({error:error.message})
        }
    }
}

export const postNotificacionAlmacenGW = async (req,res)=>{
    try {
        const data = req.body
        const response = await axios.post(`${service_notificacion}/notificacion`,data)
        if(response && response.data){
            res.status(201).json(response.data)
        }
        else{
            res.status(400).json({message:"Invalid input data"})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}


export const getNotificacionClienteGW = async (req, res) => {
    try {
        // Obtener la fecha actual en formato YYYY-MM-DD
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`; // Este formato es compatible con muchas APIs: "2025-05-30"

        const response = await axios.get(`${service_notificacion}/notificacion_cliente/${today}`);

        if (response && response.data) {
            const formattedData = response.data.map(item => {
                const dateTimeString = item.fecha.replace(' ', 'T');
                const dateObj = new Date(dateTimeString);

                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const formattedFecha = `${year}/${month}/${day}`;

                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                const formattedHora = `${hours}:${minutes}:${seconds}`;

                return {
                    id: item.id,
                    foto: item.foto,
                    titulo: item.titulo,
                    fecha: formattedFecha,
                    hora: formattedHora,
                    descripcion: item.descripcion
                };
            });

            res.status(200).json(formattedData);
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: 'No hay notificacion el día de hoy' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};



export const postNotificacionClienteGW = async (req,res)=>{
    try {
        const data = req.body
        const response = await axios.post(`${service_notificacion}/notificacion_cliente`,data)
        if(response && response.data){
            res.status(201).json(response.data)
        }
        else{
            res.status(400).json({message:"Invalid input data"})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}