import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config()

const service_publicidad = process.env.MICRO_PUBLICIDAD

export const getPublicidadControllerGW = async (req, res) => {
    try {
        const response = await axios.get(`${service_publicidad}/publicidad_banners`);
        console.log(response.data);

        if (response.data) {
            // Agrupar los banners por evento utilizando reduce
            const grouped = response.data.reduce((acc, item) => {
                const eventId = item.id;

                // Si no existe el evento en el acumulador, inicializarlo
                if (!acc[eventId]) {
                    acc[eventId] = {
                        id: eventId,
                        titulo: item.titulo,

                        fondo:item.fondo,
                        banners: []
                    };
                }

                // Agregar el banner al evento
                acc[eventId].banners.push({
                    id: item.banner_id,
                    foto: item.foto,
                    titulo: item.banner_titulo,
                    descripcion: item.descripcion,
                    restriccion:item.restriccion

                });

                return acc;
            }, {});

            // Convertir el objeto agrupado en un array y enviarlo como respuesta
            const resultado = Object.values(grouped);
            res.status(200).json(resultado);
        } else {
            res.status(400).json({ message: "Invalid input data" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};