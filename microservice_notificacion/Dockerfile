# Usar una imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos necesarios
COPY ./ /app

# Instalar las dependencias
RUN npm install

# Exponer el puerto que usa el gateway
EXPOSE 5013

# Comando para ejecutar el servicio
CMD ["node", "index.js"]
