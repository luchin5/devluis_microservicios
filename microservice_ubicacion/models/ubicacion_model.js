import { db_pool } from "../ubicacion_config.js";

const modelUbicacion = {
    //TABLA UBICACION
    getUbicacion: async () => {
        try {
            const resultado = await db_pool.any('SELECT * FROM public.ubicacion')
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getUbicacionId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone('SELECT * FROM public.ubicacion WHERE id = $1', [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    createUbicacion: async (ubicacion) => {

        try {
            const ubicaciones = await db_pool.one('INSERT INTO public.ubicacion(departamento, provincia,distrito,direccion,latitud,longitud,cliente_id,zona_trabajo_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
                [ubicacion.departamento, ubicacion.provincia, ubicacion.distrito, ubicacion.direccion, ubicacion.latitud, ubicacion.longitud, ubicacion.cliente_id, ubicacion.zona_trabajo_id])
            return ubicaciones

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }


    },

    updateRelacionesUbicacion: async (idRelacionUbicacion, zona_trabajo) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.ubicacion SET zona_trabajo_id=$1 
                WHERE id=$2 RETURNING *`, [zona_trabajo.zona_trabajo_id, idRelacionUbicacion])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    deleteRelacionesUbicacion: async (idUbicacion) => {
        try {
            const result = await db_pool.result(`DELETE FROM public.ubicacion WHERE id = $1`, [idUbicacion])
            return result.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    //TABLA ZONA TRABAJO
    getZona: async () => {
        try {
            const resultado = await db_pool.any('SELECT * FROM public.zona_trabajo')
            //console.log("zonas")
            //console.log(zona)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getZonaId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone('SELECT * FROM public.zona_trabajo WHERE id = $1', [id]);
            //console.log("zonas")
            //console.log(zona)
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    createZona: async (zona) => {

        try {
            const resultado = await db_pool.one('INSERT INTO public.zona_trabajo(nombre,poligono_coordenadas) VALUES ($1,$2) RETURNING *',
                [zona.nombre, zona.poligono_coordenadas])
            return resultado

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }


    },

    updateZona: async (id_zona, zona) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.zona_trabajo SET nombre=$1 
                WHERE id=$2 RETURNING *`, [zona.nombre, id_zona]);
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    deleteZona: async (idZona) => {
        try {
            const resultado = await db_pool.result(`DELETE FROM public.zona_trabajo WHERE id = $1`, [idZona])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    //CREACION DE LA UBICACION POR PARTE DEL APLICATIVO EN CLIENTE
    createUbicacionCliente: async (ubicacion) => {

        try {
            //TRAEMOS SOLO LOS CAMPOS QUE NECESITAMOS Y ETIQUETA QUE ES EL NUEVO CAMPO AGREGADO EN LA TABLA DE UBICACIONES
            const ubicaciones = await db_pool.one(`INSERT INTO public.ubicacion(departamento,distrito,direccion,latitud,longitud,cliente_id,etiqueta,numero_manzana) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
                [ubicacion.departamento,ubicacion.distrito, ubicacion.direccion, ubicacion.latitud, ubicacion.longitud, ubicacion.cliente_id, ubicacion.etiqueta,ubicacion.numero_manzana])
            return ubicaciones

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },

    //OBTENER LA DIRECCIÓN SELECCIONADA POR EL CLIENTE
    ultimaUbicacionCliente: async (id) => {
        try{
            //TRAEMOS LA ULTIMA DIRECCIÓN QUE INGRESO EL CLIENTE
            const resultado = await db_pool.oneOrNone(`SELECT *
                FROM public.ubicacion WHERE id = $1 ORDER BY id DESC LIMIT 1`,[id])
            return  resultado
        }catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },

    //ACTUALIZAR LA DIRECCIÓN DEL CLIENTE
    actualizarUbicacionCliente: async (idRelacionUbicacion, ubicacion) =>{
        try{
            //ACTUALIZAMOS LA DIRECCIÓN QUE SELECCIONO EL CLIENTE
            const resultado = await db_pool.oneOrNone(`UPDATE public.ubicacion SET departamento= $1, 
                distrito=$2, direccion = $3, 
                numero_manzana = $4, etiqueta =$5,
                latitud=$6, longitud=$7
                WHERE id=$8 RETURNING *`, [ubicacion.departamento, ubicacion.distrito, 
                    ubicacion.direccion, ubicacion.numero_manzana, ubicacion.etiqueta,
                    ubicacion.latitud, ubicacion.longitud,
                    idRelacionUbicacion])
            if (!resultado) {
                return null;
            }
            return resultado;
        }catch(error){
            throw new Error(`Error put data: ${error}`);
        }
    },

    //ENDPOINT QUE ME DA TODAS LAS DIRECCIONES  DE UN DETERMINADO CLIENTE
    getDepartamentoCliente: async () => {
        try{
            const resultado = await db_pool.any(`SELECT *
                FROM public.departamentos ORDER BY id ASC`)
            return  resultado
        }catch(error){
            throw new Error(`Error put data: ${error}`);
        }
    },

    //ENDPOINT DE LOS DISTRITOS
    getDistritosCliente: async (id) => {
        try{
            const resultado = await db_pool.any(`SELECT *
                FROM public.distritos WHERE departamento_id =$1 ORDER BY id ASC`,[id])
            return  resultado
        }catch(error){
            throw new Error(`Error put data: ${error}`);
        }
    },

    //ENDPOINT QUE ME DA TODAS LAS DIRECCIONES  DE UN DETERMINADO CLIENTE
    getDireccionesCliente: async (cliente) => {
        try{
            //TRAEMOS TODAS LAS DIRECCIONES DEL CLIENTE
            const resultado = await db_pool.any(`SELECT *
                FROM public.ubicacion WHERE cliente_id = $1 ORDER BY id DESC`,[cliente])
            return  resultado
        }catch(error){
            throw new Error(`Error put data: ${error}`);
        }
    }


}
export default modelUbicacion