import { db_pool } from "../categoria_config.js";

const modelCategoria = {
    //TABLA CATEGORIA
    getAllCategoria: async () => {
        try {
            const resultado = await db_pool.any('SELECT * FROM public.categoria ORDER BY id ASC')
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //TABLA CATEGORIA POR ID
    getAllCategoriaPorID: async (id) => {
    try {
        // Obtenemos los datos sin procesar desde la base de datos
        const rawData = await db_pool.any(`
            SELECT
                c.id AS categoria_id,
                c.nombre AS categoria_nombre,
                s.id AS subcategoria_id,
                s.nombre AS subcategoria_nombre,
                s.icono,
                s.fecha_inicio,
                s.fecha_fin,
                sp.producto_id,
                NULL AS promocion_id
            FROM public.categoria c
            INNER JOIN public.subcategoria s ON s.categoria_id = c.id
            INNER JOIN public.subcategoria_producto sp ON sp.subcategoria_id = s.id
            WHERE c.id = $1
            
            UNION ALL
            
            SELECT
                c.id AS categoria_id,
                c.nombre AS categoria_nombre,
                s.id AS subcategoria_id,
                s.nombre AS subcategoria_nombre,
                s.icono,
                s.fecha_inicio,
                s.fecha_fin,
                NULL AS producto_id,
                spp.promocion_id
            FROM public.categoria c
            INNER JOIN public.subcategoria s ON s.categoria_id = c.id
            INNER JOIN public.subcategoria_promocion spp ON spp.subcategoria_id = s.id
            WHERE c.id = $1
            
            ORDER BY subcategoria_id ASC;
        `, [id]);
        
        // Si no hay resultados, retornamos un array vacío
        if (!rawData || rawData.length === 0) {
            return [];
        }
        
        // Reestructuración de los datos
        const resultado = {
            id: rawData[0].categoria_id,
            nombre: rawData[0].categoria_nombre,
            subcategorias: []
        };
        
        // Mapa para agrupar subcategorías por ID
        const subcategoriasMap = new Map();
        
        // Procesamos los resultados para agrupar subcategorías
        rawData.forEach(row => {
            const subcategoriaId = row.subcategoria_id;
            
            // Si esta subcategoría no está en el mapa, la añadimos
            if (!subcategoriasMap.has(subcategoriaId)) {
                subcategoriasMap.set(subcategoriaId, {
                    id: subcategoriaId,
                    nombre: row.subcategoria_nombre,
                    icono: row.icono,
                    fecha_inicio: row.fecha_inicio,
                    fecha_fin: row.fecha_fin,
                    productos: [],
                    promociones: []
                });
            }
            
            const subcategoria = subcategoriasMap.get(subcategoriaId);
            
            // Añadir producto si existe y no supera el límite
            if (row.producto_id && subcategoria.productos.length < 3 && 
                !subcategoria.productos.includes(row.producto_id)) {
                subcategoria.productos.push(row.producto_id);
            }
            
            // Añadir promoción si existe y no supera el límite
            if (row.promocion_id && subcategoria.promociones.length < 3 && 
                !subcategoria.promociones.includes(row.promocion_id)) {
                subcategoria.promociones.push(row.promocion_id);
            }
        });
        
        // Convertir el mapa a un array y limitarlo a 2 subcategorías
        resultado.subcategorias = Array.from(subcategoriasMap.values()).slice(0, 2);
        
        return resultado;
    } catch (error) {
        throw new Error(`Error get data: ${error}`);
    }
},

    //ENDPOINT QUE ME SIRVE PARA VER LA INFORMACION QUE APARECE EN VER MÁS
    getAllProductosSubcategoria: async (subcategoriaId) => {
    try {
        // Consulta simplificada para obtener datos de la subcategoría
        const rawData = await db_pool.any(`
            SELECT
                s.id AS subcategoria_id,
                s.nombre AS subcategoria_nombre,
                s.icono,
                s.fecha_inicio,
                s.fecha_fin,
                sp.producto_id,
                NULL AS promocion_id
            FROM public.subcategoria s
            LEFT JOIN public.subcategoria_producto sp ON sp.subcategoria_id = s.id
            WHERE s.id = $1

            UNION ALL

            SELECT
                s.id AS subcategoria_id,
                s.nombre AS subcategoria_nombre,
                s.icono,
                s.fecha_inicio,
                s.fecha_fin,
                NULL AS producto_id,
                spp.promocion_id
            FROM public.subcategoria s
            LEFT JOIN public.subcategoria_promocion spp ON spp.subcategoria_id = s.id
            WHERE s.id = $1
        `, [subcategoriaId]);

        if (!rawData || rawData.length === 0) {
            return null; // No existe subcategoría con ese ID
        }

        // Armamos el objeto de respuesta
        const subcategoria = {
            id: rawData[0].subcategoria_id,
            nombre: rawData[0].subcategoria_nombre,
            icono: rawData[0].icono,
            fecha_inicio: rawData[0].fecha_inicio,
            fecha_fin: rawData[0].fecha_fin,
            productos: [],
            promociones: []
        };

        // Llenamos productos y promociones sin restricciones
        rawData.forEach(row => {
            if (row.producto_id && !subcategoria.productos.includes(row.producto_id)) {
                subcategoria.productos.push(row.producto_id);
            }
            if (row.promocion_id && !subcategoria.promociones.includes(row.promocion_id)) {
                subcategoria.promociones.push(row.promocion_id);
            }
        });

        return subcategoria;
    } catch (error) {
        throw new Error(`Error al obtener la subcategoría: ${error}`);
    }
},


    //TABLA SUB-CATEGORIA POR ID
    getSubcategoriaById: async (subcategoriaId) => {
        try {
            const resultado = await db_pool.any(`
                SELECT 
                    s.id AS subcategoria_id, 
                    s.nombre AS subcategoria_nombre,
                    s.icono,
                    s.fecha_inicio,
                    s.fecha_fin,
                    sp.producto_id,
                    NULL AS promocion_id
                FROM public.subcategoria s
                INNER JOIN public.subcategoria_producto sp ON sp.subcategoria_id = s.id
                WHERE s.id = $1
    
                UNION ALL
    
                SELECT 
                    s.id AS subcategoria_id, 
                    s.nombre AS subcategoria_nombre,
                    s.icono,
                    s.fecha_inicio,
                    s.fecha_fin,
                    NULL AS producto_id,
                    spp.promocion_id
                FROM public.subcategoria s
                INNER JOIN public.subcategoria_promocion spp ON spp.subcategoria_id = s.id
                WHERE s.id = $1
    
                ORDER BY subcategoria_id ASC;
            `, [subcategoriaId]);
    
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    
    getSubcategoriaByIdNombre: async (subcategoriaId) => {
        try {
            const resultado = await db_pool.any(`
                SELECT *
                FROM public.subcategoria
                WHERE id = $1
                ORDER BY id ASC;
            `, [subcategoriaId]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    //TABLA CATEGORIA TODOS LOS REGISTROS
    getCategoriasPorUbicacion: async () => {
        try {
            const resultado = await db_pool.any('SELECT * FROM public.categoria ORDER BY id ASC LIMIT 3')
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },


    //TABLA ESPECIFICA QUE ME PERMITE SACAR DE UNA CATEGORIA TODAS LAS SUBCATEGORIAS
    getCategoriaAllSubcategoriasPorID: async (id) => {
    const hora_backend = new Date();
    try {
        // Obtenemos los datos sin procesar desde la base de datos
        const rawData = await db_pool.any(`
            SELECT
                c.id AS categoria_id,
                c.nombre AS categoria_nombre,
                s.id AS subcategoria_id,
                s.nombre AS subcategoria_nombre,
                s.icono,
                s.fecha_inicio,
                s.fecha_fin,
                sp.producto_id,
                NULL AS promocion_id
            FROM public.categoria c
            INNER JOIN public.subcategoria s ON s.categoria_id = c.id
            INNER JOIN public.subcategoria_producto sp ON sp.subcategoria_id = s.id
            WHERE c.id = $1 AND $2 >= s.fecha_inicio  AND $2 < s.fecha_fin

            UNION ALL

            SELECT
                c.id AS categoria_id,
                c.nombre AS categoria_nombre,
                s.id AS subcategoria_id,
                s.nombre AS subcategoria_nombre,
                s.icono,
                s.fecha_inicio,
                s.fecha_fin,
                NULL AS producto_id,
                spp.promocion_id
            FROM public.categoria c
            INNER JOIN public.subcategoria s ON s.categoria_id = c.id
            INNER JOIN public.subcategoria_promocion spp ON spp.subcategoria_id = s.id
            WHERE c.id = $1 AND $2 >= s.fecha_inicio AND $2 < s.fecha_fin

            ORDER BY subcategoria_id ASC;
        `, [id, hora_backend]);

        if (!rawData || rawData.length === 0) {
            return [];
        }

        const resultado = {
            id: rawData[0].categoria_id,
            nombre: rawData[0].categoria_nombre,
            subcategorias: []
        };

        const subcategoriasMap = new Map();

        rawData.forEach(row => {
            const subcategoriaId = row.subcategoria_id;

            if (!subcategoriasMap.has(subcategoriaId)) {
                subcategoriasMap.set(subcategoriaId, {
                    id: subcategoriaId,
                    nombre: row.subcategoria_nombre,
                    icono: row.icono,
                    fecha_inicio: row.fecha_inicio,
                    fecha_fin: row.fecha_fin,
                    productos: [],
                    promociones: []
                });
            }

            const subcategoria = subcategoriasMap.get(subcategoriaId);

            if (row.producto_id && !subcategoria.productos.includes(row.producto_id)) {
                subcategoria.productos.push(row.producto_id);
            }

            if (row.promocion_id && !subcategoria.promociones.includes(row.promocion_id)) {
                subcategoria.promociones.push(row.promocion_id);
            }
        });

        // Convertimos el mapa completo sin restricciones
        resultado.subcategorias = Array.from(subcategoriasMap.values());

        return resultado;
    } catch (error) {
        throw new Error(`Error get data: ${error}`);
    }
}

    


}

export default modelCategoria