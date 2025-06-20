import { db_pool, db_aguaSol } from "../login_config.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = "aguasol";

const modelAuth = {
  Login: async (credenciales) => {
    try {
      // EXISTS USER
      const existsUser = await db_pool.oneOrNone(
        `SELECT * FROM public.usuario WHERE nickname = $1`,
        [credenciales.nickname]
      );
      if (existsUser != null) {
        // CLIENTE
        if (existsUser.rol_id === 4) {
          console.log("CONTRASENA ----<");
          console.log(existsUser.contrasena);
          console.log("...... ? ........");
          console.log(
            existsUser &&
              (await bcrypt.compare(
                credenciales.contrasena,
                existsUser.contrasena
              ))
          );
          if (
            existsUser &&
            (await bcrypt.compare(
              credenciales.contrasena,
              existsUser.contrasena
            ))
          ) {
            const tokenUser = jwt.sign({ user: existsUser }, SECRET_KEY);
            return { existsUser, tokenUser };
          } else {
            return { message: "Invalid credentials!" };
          }
        }

        // CONDUCTOR
        else if (existsUser.rol_id === 5) {
          if (
            existsUser &&
            (await bcrypt.compare(
              credenciales.contrasena,
              existsUser.contrasena
            ))
          ) {
            const tokenUser = jwt.sign({ user: existsUser }, SECRET_KEY);
            return { existsUser, tokenUser };
          } else {
            return { message: "Invalid credentials!" };
          }
        } 
        
        //CENTRAL
        else if (existsUser.rol_id === 3) {
          if (
            existsUser &&
            (await bcrypt.compare(
              credenciales.contrasena,
              existsUser.contrasena
            ))
          ) {
            const tokenUser = jwt.sign({ user: existsUser }, SECRET_KEY);
            return { existsUser, tokenUser };
          } else {
            return { message: "Invalid credentials!" };
          }
        } 
        
        else {
          return { message: "Roule not authorized!" };
        }
      } else {
        return { message: "User not Found" };
      }
    } catch (error) {
      throw new Error(`Error query login ${error}`);
    }
  },
  createUser: async (credenciales) => {
    try {
      console.log("/////// en login model");
      console.log(credenciales);
      const userExist = await db_pool.oneOrNone(
        `SELECT * FROM public.usuario WHERE firebase_uid=$1`,
        [credenciales.firebase_uid]
      );

      if (userExist) {
        console.log("...exist en loginmodel");
        return { message: "User exist!" };
      } else {
        const newUser = await db_pool.one(
          `INSERT INTO public.usuario (rol_id,email,telefono,firebase_uid)
                    VALUES ($1,$2,$3,$4) RETURNING *`,
          [
            credenciales.rol_id,
            credenciales.email,
            credenciales.telefono,
            credenciales.firebase_uid,
          ]
        );

        return newUser;
      }
    } catch (error) {
      throw new Error(`Error post user ${error}`);
    }
  },
    upsertMicroUser: async (credenciales) => {
  try {
    const existingUser = await db_pool.oneOrNone(
      `SELECT * FROM public.usuario WHERE firebase_uid = $1`,
      [credenciales.firebase_uid]
    );

    if (existingUser) {
      const updated = await db_pool.one(
        `UPDATE public.usuario SET
            rol_id = $1,
            email = $2,
            telefono = $3
         WHERE firebase_uid = $4
         RETURNING *`,
        [
          credenciales.rol_id,
          credenciales.email,
          credenciales.telefono,
          credenciales.firebase_uid
        ]
      );
      return updated;
    } else {
      const created = await db_pool.one(
        `INSERT INTO public.usuario (rol_id, email, telefono, firebase_uid)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          credenciales.rol_id,
          credenciales.email,
          credenciales.telefono,
          credenciales.firebase_uid
        ]
      );
      return created;
    }
  } catch (error) {
    throw new Error(`Error upsert user ${error}`);
  }
},

createMicroUser: async (credenciales) => {
  try {
    const userExist  = await db_pool.oneOrNone(
      `SELECT * FROM public.usuario WHERE firebase_uid = $1`,
      [credenciales.firebase_uid]
    );

    if (userExist) {
      // Usuario ya existe, no se hace inserción
        return { message: "User exist!" };
    }
    else {
    const newUser  = await db_pool.one(
      `INSERT INTO public.usuario (rol_id, email, telefono, firebase_uid)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        credenciales.rol_id,
        credenciales.email,
        credenciales.telefono,
        credenciales.firebase_uid
      ]
    );
    return newUser;
          }
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
},


  existUser: async (credenciales) => {
    try {
      console.log("............ EXISTE USER ?");
      console.log(credenciales);
      const userExist = await db_pool.oneOrNone(
        `SELECT * FROM public.usuario WHERE nickname=$1`,
        [credenciales.nickname]
      );

      if (!userExist) {
        return { message: "User new" };
      } else {
        return { message: "User exist!" };
      }
    } catch (error) {
      throw new Error(`Error query get: ${error}`);
    }
  },
  getTelefono: async (id) => {
    try {
      const resultadoAguaSol = await db_pool.oneOrNone(`SELECT * FROM public.usuario WHERE id = $1`,[id]);
      return resultadoAguaSol;
    } catch (error) {
      throw new Error(`Error get data: ${error}`);
    }
  },
  getTelefonoDistribuidor: async (id) => {
    try {
      const resultadoAguaSol = await db_pool.oneOrNone(`SELECT telefono FROM public.usuario WHERE id = $1`,[id]);
      return resultadoAguaSol;
    } catch (error) {
      throw new Error(`Error get data: ${error}`);
    }
  },
  getInfoUser: async (id) => {
    try {
      const resultado = await db_pool.oneOrNone(`SELECT * FROM public.usuario WHERE id = $1`,[id]);
      return resultado;
    } catch (error) {
      throw new Error(`Error get data: ${error}`);
    }
  },

  actualizarUsuario: async (id, usuario) => {
          try {
              const resultado = await db_pool.oneOrNone(`
                  UPDATE public.usuario SET telefono = $1, email = $2 WHERE id = $3 RETURNING *`,
                  [
                      usuario.telefono, usuario.email, id
                  ]);
              if (!resultado) {
                  return null;
              }
              return resultado
          } catch (error) {
              throw new Error(`Error put data: ${error.message}`);
          }
      },
   updateTelefono: async (telefono, firebaseUId) => {//Add commentMore actions
    try {
      console.log(".....datos put")
      console.log(telefono,firebaseUId)
      const resultado = await db_pool.one(
        `UPDATE public.usuario SET telefono = $1 WHERE firebase_uid = $2 RETURNING *`,
        [telefono.telefono, firebaseUId]
      );
      console.log("..........MODEL LOGIN UPPATE")
      console.log(resultado)

      return resultado;
    } catch (error) {
      throw new Error(`Error en la peticion: ${error}`);
    }
  },
   // nuevo método
  getFirebaseuid: async (firebaseUid) => {
    try {
      console.log(".......firebase....");
      const usuario = await db_pool.oneOrNone(
        `
        SELECT * FROM public.usuario WHERE firebase_uid = $1`,
        [firebaseUid]
      );
      console.log("....hay algo?");
      console.log(usuario);
      return usuario;
    } catch (error) {
      throw new Error(`Error en el servidor ${error}`);
    }
  },
};

export default modelAuth;
