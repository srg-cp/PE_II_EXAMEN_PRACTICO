# 🧠 MindPlan - Sistema Colaborativo de Planeamiento Estratégico de TI

MindPlan es una aplicación web colaborativa diseñada para facilitar el proceso de planeamiento estratégico de TI en organizaciones. Permite a los equipos crear, gestionar y colaborar en proyectos estratégicos de manera eficiente, organizada y controlada.

## 🚀 Características Principales

### 📋 Gestión de Proyectos
- **Creación y administración** de proyectos de planeamiento estratégico
- **Colaboración en tiempo real** entre miembros del equipo
- **Control de acceso** y gestión de permisos por proyecto
- **Dashboard intuitivo** para visualización general de proyectos

### 📊 Secciones Estratégicas
- **Misión y Visión**: Definición clara de propósito y objetivos organizacionales
- **Objetivos Estratégicos**: Gestión de metas con prioridades y estados de seguimiento
- **Análisis FODA**: Evaluación completa de Fortalezas, Oportunidades, Debilidades y Amenazas
- **Identificación de Estrategias**: Desarrollo de planes de acción estratégicos
- **Conclusiones**: Síntesis y resultados del proceso de planeamiento

### 🔧 Funcionalidades Técnicas
- **Editor de texto enriquecido** con React Quill
- **Exportación a PDF** de documentos estratégicos
- **Historial de versiones** y seguimiento de cambios
- **Comunicación en tiempo real** con Socket.IO
- **Interfaz responsive** con Material-UI
- **Autenticación segura** con JWT

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.2.0** - Framework principal
- **Material-UI 5.14.5** - Componentes de interfaz
- **React Router 6.15.0** - Navegación
- **Socket.IO Client 4.8.1** - Comunicación en tiempo real
- **Axios 1.5.0** - Cliente HTTP
- **React Quill 2.0.0** - Editor de texto enriquecido
- **jsPDF 2.5.1** - Generación de PDFs
- **html2canvas 1.4.1** - Captura de elementos HTML
- **React Beautiful DnD 13.1.1** - Drag and drop
- **Vite 4.4.5** - Build tool
- **Tailwind CSS 3.3.3** - Framework CSS

### Backend
- **Node.js** - Runtime de JavaScript
- **Express 4.18.2** - Framework web
- **MongoDB** con **Mongoose 7.5.0** - Base de datos
- **Socket.IO 4.7.2** - Comunicación en tiempo real
- **JWT** - Autenticación
- **bcryptjs 2.4.3** - Encriptación de contraseñas
- **Puppeteer 21.1.1** - Generación de PDFs del lado del servidor
- **Handlebars 4.7.8** - Motor de plantillas

## 📁 Estructura del Proyecto

MindPlan/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── contexts/       # Contextos de React
│   │   └── utils/          # Utilidades y helpers
│   ├── package.json
│   └── vite.config.js
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores de rutas
│   │   ├── models/         # Modelos de MongoDB
│   │   ├── routes/         # Definición de rutas
│   │   ├── middleware/     # Middleware personalizado
│   │   └── socket/         # Configuración de Socket.IO
│   └── package.json
└── README.md

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- MongoDB
- npm

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/srg-cp/mindplan.git
cd mindplan
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
npm install socket.io-client react-quill
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
npm install socket.io-client react-quill
```

4. **Configurar variables de entorno**

Crear archivo `.env` en la carpeta `backend`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindplan
JWT_SECRET=tu_jwt_secret_aqui
NODE_ENV=development
```

Crear archivo `.env` en la carpeta `frontend`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Ejecución

1. **Iniciar el backend**
```bash
cd backend
npm run dev
```

2. **Iniciar el frontend**
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📖 Uso de la Aplicación

### 1. Registro y Autenticación
- Crear una cuenta nueva o iniciar sesión
- Sistema de autenticación seguro con JWT

### 2. Dashboard
- Vista general de todos los proyectos
- Acceso rápido a proyectos recientes
- Creación de nuevos proyectos

### 3. Gestión de Proyectos
- Crear proyectos con nombre, descripción y objetivos
- Invitar colaboradores al proyecto
- Configurar permisos y accesos

### 4. Trabajo Colaborativo
- Edición simultánea en tiempo real
- Historial de cambios y versiones

### 5. Exportación
- Generar documentos PDF profesionales
- Incluir todas las secciones del planeamiento
- Formato personalizable

## 👥 Equipo de Desarrollo

- **Sergio Alberto Colque Ponce** - Desarrollador Full Stack
- **Renzo Antayhua** - Desarrollador Full Stack  
- **Reenzo Loyola** - Desarrollador Full Stack

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Scripts Disponibles

### Frontend
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

### Backend
```bash
npm start        # Servidor de producción
npm run dev      # Servidor de desarrollo con nodemon
npm test         # Ejecutar tests
```

## 🔒 Seguridad

- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Validación de datos de entrada
- Protección CORS configurada
- Middleware de autenticación en rutas protegidas

## 📊 Funcionalidades Avanzadas

- **Gestión de objetivos** con prioridades y estados
- **Exportación PDF** con plantillas profesionales
- **Historial de versiones** completo
- **Colaboración en tiempo real** con Socket.IO

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor crea un issue en el repositorio incluyendo:
- Descripción detallada del problema
- Pasos para reproducir el bug
- Capturas de pantalla si es necesario
- Información del navegador y sistema operativo

## 📄 Licencia

Este proyecto está bajo la Licencia APACHE 2.0. Ver el archivo `LICENSE` para más detalles.

**MindPlan** - Transformando la manera en que las organizaciones planifican su futuro tecnológico 🚀