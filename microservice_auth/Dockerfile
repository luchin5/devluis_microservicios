# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del servicio al contenedor
COPY . /app

# Instala las dependencias
RUN npm install

# Expone el puerto que el servicio va a utilizar, SOLO ES FORMALIDAD, MÁS NO FUNCIONAL
EXPOSE 5001

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
