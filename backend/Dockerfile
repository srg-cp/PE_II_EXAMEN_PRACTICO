# Usar Node.js 18 LTS como imagen base
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY src/ ./src/

# Exponer el puerto
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]