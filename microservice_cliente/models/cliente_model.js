import { db_pool } from "../cliente_config.js"

const modelCliente = {
    getCliente: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.cliente`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getClienteUserId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.cliente WHERE id = $1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getClienteUser_Id: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.cliente WHERE usuario_id = $1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getUsuariosTotalesMes: async (mesAnio) => {
        try {
            // Procesar el parámetro mesAnio (formato: 'YYYY-MM')
            const [anio, mes] = mesAnio.split('-');

            // Crear fechas de inicio y fin del mes
            const fechaInicio = `${anio}-${mes}-01`;
            const fechaFin = mes === '12' ? `${parseInt(anio) + 1}-01-01` : `${anio}-${parseInt(mes) + 1}-01`;

            const resultado = await db_pool.one(`
                SELECT 
                    COUNT(*) AS total_usuarios 
                FROM public.cliente
                WHERE fecha_creacion >= $1 AND fecha_creacion < $2
            `, [fechaInicio, fechaFin]);

            return resultado;
        } catch (error) {
            throw new Error(`Error al obtener total de usuarios: ${error}`);
        }
    },

    getUsuariosPorDiaMes: async (mesAnio) => {
        try {
            // Procesar el parámetro mesAnio (formato: 'YYYY-MM')
            const [anio, mes] = mesAnio.split('-');

            // Crear fechas de inicio y fin del mes
            const fechaInicio = `${anio}-${mes}-01`;
            const fechaFin = mes === '12' ? `${parseInt(anio) + 1}-01-01` : `${anio}-${parseInt(mes) + 1}-01`;

            const resultado = await db_pool.any(`
                SELECT 
                    DATE(fecha_creacion) AS dia, 
                    COUNT(*) AS total_usuarios
                FROM public.cliente
                WHERE fecha_creacion >= $1 AND fecha_creacion < $2
                GROUP BY dia
                ORDER BY dia
            `, [fechaInicio, fechaFin]);

            return resultado;
        } catch (error) {
            throw new Error(`Error al obtener usuarios por día: ${error}`);
        }
    },

    postCliente: async (cliente) => {
        console.log("....TRAR")//Add commentMore actions
        console.log(cliente);
        try {
            /*
            const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
            let CODE = '';

            for (let i = 0; i < 5; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                CODE += characters.charAt(randomIndex);
            }
*/
            const resultado = await db_pool.one(`
                INSERT INTO public.cliente (
                    usuario_id, nombres, apellidos,fecha_creacion,foto_cliente
                ) VALUES (
                    $1, $2, $3, $4, $5
                ) RETURNING *
            `, [
                cliente.usuario_id,cliente.nombres,cliente.apellidos,new Date(),cliente.foto_cliente
            ]);

            return resultado;

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },

    postMicroCliente: async (cliente) => {
        try {//Add commentMore actions

            console.log("ENTRANDO.....");
            console.log(cliente)
            // First check if a client already exists for this user_id
            const existingCliente = await db_pool.oneOrNone(
                'SELECT * FROM public.cliente WHERE usuario_id = $1',
                [cliente.usuario_id]
            );

            if (existingCliente) {
                // Client already exists, return it
                return existingCliente;
            }
            const hora_backend =  new Date();
            const resultado = await db_pool.one(//Add commentMore actions
            `INSERT INTO public.cliente (
              usuario_id, nombres, apellidos, fecha_creacion, foto_cliente
            ) VALUES (
              $1, $2, $3, $4, $5
            ) RETURNING *`
          , [
                cliente.usuario_id,
                cliente.nombre,
                cliente.apellidos,hora_backend,//Add commentMore actions
               // cliente.fecha_creacion,
                cliente.foto_cliente
            ]);
        return resultado;//More actions
        } catch (error) {
            throw new Error(`Error post cliente ${error}`);
        }
    },
    upsertMicroCliente: async (cliente) => {
  try {
    const existing = await db_pool.oneOrNone(
      'SELECT * FROM public.cliente WHERE usuario_id = $1',
      [cliente.usuario_id]
    );

    if (existing) {
      const updated = await db_pool.one(
        `UPDATE public.cliente SET
            nombres = $2,
            apellidos = $3,
            foto_cliente = $4
         WHERE usuario_id = $1
         RETURNING *`,
        [
          cliente.usuario_id,
          cliente.nombres,
          cliente.apellidos,
          cliente.foto_cliente
        ]
      );
      return updated;
    } else {
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
      let CODE = '';
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        CODE += characters.charAt(randomIndex);
      }

      const inserted = await db_pool.one(
        `INSERT INTO public.cliente (
          usuario_id, nombres, apellidos, fecha_creacion, foto_cliente
        ) VALUES (
          $1, $2, $3, $4, $5
        ) RETURNING *`,
        [
          cliente.usuario_id,
          cliente.nombres,
          cliente.apellidos,
          cliente.fecha_creacion || new Date(),
          cliente.foto_cliente
        ]
      );
      return inserted;
    }
  } catch (error) {
    throw new Error(`Error upsert cliente ${error}`);
  }
},


    putCliente: async (id, cliente) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                UPDATE public.cliente SET nombres = $1, apellidos = $2, numero_cuenta = $3 WHERE id = $4 RETURNING *`,
                [
                    cliente.nombres, cliente.apellidos,
                    cliente.numero_cuenta, id,
                ]);
            if (!resultado) {
                return null;
            }
            return resultado
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },
    deleteCliente: async (id) => {
        try {
            const resultado = await db_pool.result(`DELETE FROM public.cliente WHERE id = $1`,
                [id]
            );
            return resultado.rowCount === 1;
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },
    updateCalficationCliente: async (id, newCalification) => {
        try {

            const resultadoCalification = await modelCliente.getClienteUserId(id)

            const { calificacion } = resultadoCalification


            var promedioCalification = ((calificacion + newCalification.calificacion) / 2.0).toFixed(1)



            if (promedioCalification > 5) {
                const resultado = await db_pool.oneOrNone(`
                    UPDATE public.cliente SET calificacion = $1 WHERE id = $2 RETURNING *`, [5.0, id])
                if (!resultado) {
                    return null
                }
                return resultado
            }
            else {
                const resultado = await db_pool.oneOrNone(`
                    UPDATE public.cliente SET calificacion = $1 WHERE id = $2 RETURNING *`, [promedioCalification, id])
                if (!resultado) {
                    return null
                }
                return resultado
            }





        } catch (error) {
            throw new Error(`Error update calification ${error}`)
        }
    },

    //NOS PERMITE HACER UN POST DE UN REGISTRO DE CALIFICACION
    postValoracionCliente: async (valoracion) => {
        try {
            // EL CAMPO DE CLIENTE_ID DEBE SER OBLIGATORIO
            if (!valoracion.cliente_id) {
                throw new Error('cliente_id es obligatorio');
            }

            const resultado = await db_pool.one(`
            INSERT INTO public.valoracion_cliente (
              cliente_id, producto_id, promocion_id, calificacion
            ) VALUES (
              $1, $2, $3, $4
            ) RETURNING *
          `, [
                valoracion.cliente_id,
                valoracion.producto_id || null,
                valoracion.promocion_id || null,
                valoracion.calificacion
            ]);

            return resultado;
        } catch (error) {
            throw new Error(`Error post data: ${error.message}`);
        }
    },

    getValoracionProductoId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT COUNT(*) AS total_valoraciones
FROM public.valoracion_cliente
WHERE producto_id = $1;`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getValoracionPromocionId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT COUNT(*) AS total_valoraciones
FROM public.valoracion_cliente
WHERE promocion_id = $1;`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    
    //MODELO QUE ME SIRVE PARA VER EL PROMEDIO DE LA CALIFICACION DE TODOS LOS CLIENTES
    getPromedioValoracionProductoId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT ROUND(AVG(calificacion)::numeric, 1) AS promedio_calificacion
FROM public.valoracion_cliente
WHERE producto_id = $1;`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //MODELO QUE ME SIRVE PARA VER EL PROMEDIO DE LA CALIFICACION DE TODOS LOS CLIENTES de un promedio
    getPromedioValoracionPromocionId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT ROUND(AVG(calificacion)::numeric, 1) AS promedio_calificacion
FROM public.valoracion_cliente
WHERE promocion_id = $1;`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //MODELO QUE ME AYUDA A TRAER LA SENTENCIAS SQL QUE ME PERMITE  TRAER LA VALORACION DEL PRODUCTO
    getValoracionesClienteLast: async (id) =>{
        try{
            const resultado =await db_pool.any(`
                SELECT valoracion_cliente.id,nombres,apellidos,valoracion_cliente.calificacion
FROM cliente
INNER JOIN valoracion_cliente
    ON cliente.id = valoracion_cliente.cliente_id
where valoracion_cliente.producto_id = $1
order by valoracion_cliente.calificacion desc
	limit 2;`,[id]);
            return resultado;
        } catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },

    //MODELO QUE ME AYUDA A TRAER LA SENTENCIAS SQL QUE ME PERMITE TRAE LA VALORACION DE LA PROMOCION
    getValoracionesClientePromoLast: async (id) =>{
        try{
            const resultado =await db_pool.any(`
                SELECT valoracion_cliente.id,nombres,apellidos,valoracion_cliente.calificacion
FROM cliente
INNER JOIN valoracion_cliente
    ON cliente.id = valoracion_cliente.cliente_id
WHERE valoracion_cliente.promocion_id = $1
ORDER BY valoracion_cliente.calificacion DESC
	LIMIT 2;`,[id]);
            return resultado;
        } catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },

    //POST QUE ME SIRVE PARA PODER HACER ESTA VALORACION DE CLIENTE
    postSoporteCliente: async (soporte) => {
        try {
            const resultado = await db_pool.one(`
            INSERT INTO public.soporte_tecnico (
              cliente_id, asunto, descripcion
            ) VALUES (
              $1, $2, $3
            ) RETURNING *
          `, [
                soporte.cliente_id,
                soporte.asunto,
                soporte.descripcion
            ]);

            return resultado;
        } catch (error) {
            throw new Error(`Error post data: ${error.message}`);
        }
    },

    //POST LIBRO DE RECLAMACIONES
    postLibroReclamacion: async (reclamacion) => {
        try {
            const resultado = await db_pool.one(`
            INSERT INTO public.libro_reclamaciones (
              nombres, apellidos, dni, fecha, tipo_reclamo, descripcion
            ) VALUES (
              $1, $2, $3, $4, $5, $6
            ) RETURNING *
          `, [
                reclamacion.nombres,
                reclamacion.apellidos,
                reclamacion.dni,
                reclamacion.fecha,
                reclamacion.tipo_reclamo,
                reclamacion.descripcion 
            ]);
            console.log("------------------------->")
            console.log(resultado)
            return resultado;
        } catch (error) {
            throw new Error(`Error post data: ${error.message}`);
        }
    },

    actualizarPerfil: async (id, cliente) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                UPDATE public.cliente SET nombres = $1, apellidos = $2 WHERE id = $3 RETURNING *`,
                [
                    cliente.nombres, cliente.apellidos, id
                ]);
            if (!resultado) {
                return null;
            }
            return resultado
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    createMicroCliente: async (cliente) => {
  try {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let CODE = '';
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      CODE += characters.charAt(randomIndex);
    }

    const inserted = await db_pool.one(
      `INSERT INTO public.cliente (
        usuario_id, nombres, apellidos, fecha_creacion, foto_cliente
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING *`,
      [
        cliente.usuario_id,
        cliente.nombres,
        cliente.apellidos,
        cliente.fecha_creacion || new Date(),
        cliente.foto_cliente
      ]
    );
    return inserted;
  } catch (error) {
    throw new Error(`Error creating cliente: ${error}`);
  }
},
getLibroReclamaciones: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT 
                * FROM public.libro_reclamaciones ORDER BY id DESC;
            `);

            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

getSoporteTecnico: async () => {
    try {
        const resultado = await db_pool.any(`
            SELECT 
                st.*, 
                c.nombres, 
                c.apellidos
            FROM 
                public.soporte_tecnico st
            INNER JOIN 
                public.cliente c ON st.cliente_id = c.id
            ORDER BY 
                st.id DESC;
        `);

        return resultado;
    } catch (error) {
        throw new Error(`Error get data: ${error}`);
    }
},



}

export default modelCliente