const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();

// ----------------------------------------------------
// CONFIGURACIÓN DE CORS
// Permite peticiones desde localhost, subdominios de Vercel y FRONTEND_URL
// ----------------------------------------------------
const allowedOriginEnv = process.env.FRONTEND_URL;

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes directas o de herramientas (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Si coincide con FRONTEND_URL o comodín
    if (allowedOriginEnv && (origin === allowedOriginEnv || allowedOriginEnv === '*')) {
      return callback(null, true);
    }

    // Permitir cualquier subdominio de Vercel (*.vercel.app) y localhost
    const isVercel = /\.vercel\.app$/.test(origin);
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);

    if (isVercel || isLocalhost || !allowedOriginEnv) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middlewares para procesar JSON y formularios URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta de imágenes estáticas sólo si existe físicamente (desarrollo local)
const uploadsPath = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsPath)) {
  app.use('/uploads', express.static(uploadsPath));
}

// ----------------------------------------------------
// CONEXIÓN A MONGODB ATLAS (OPTIMIZADA PARA SERVERLESS/VERCEL)
// ----------------------------------------------------
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('La variable de entorno MONGO_URI no está configurada');
  }

  // Si ya hay una conexión en curso, esperamos a que termine
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return mongoose.connection;
  }

  // Opciones recomendadas para Mongoose en entornos Serverless
  cachedConnection = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  console.log('🟢 Conectado con éxito a MongoDB Atlas (hechobygaby)');
  return cachedConnection;
}

// Intentar conectar al iniciar si estamos en desarrollo local
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectToDatabase().catch((err) => {
    console.error('🔴 Error inicial conectando a MongoDB Atlas:', err.message);
  });
}

// Middleware para asegurar la conexión de MongoDB en cada solicitud (crítico en Vercel)
app.use(async (req, res, next) => {
  // Las rutas informativas no requieren esperar a la base de datos
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('🔴 Error de conexión a la base de datos:', err.message);
    res.status(500).json({
      error: 'Error de conexión con MongoDB Atlas',
      mensaje: 'Verifica que la variable de entorno MONGO_URI esté configurada en Vercel (Project Settings > Environment Variables).',
      detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ----------------------------------------------------
// RUTAS PRINCIPALES
// ----------------------------------------------------

// Ruta raíz de bienvenida y diagnóstico
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    mensaje: '🧁 API HechoByGaby funcionando correctamente en Vercel',
    ambiente: process.env.VERCEL ? 'Vercel Serverless' : 'Servidor Node.js Local',
    database: mongoose.connection.readyState === 1 ? 'conectado' : 'esperando consulta',
    endpoints: {
      health: '/api/health',
      productos: '/api/products',
      galeria: '/api/gallery'
    }
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    platform: process.env.VERCEL ? 'vercel' : 'local',
    timestamp: new Date().toISOString()
  });
});

// Rutas modulares de productos y galería
app.use('/api/products', productRoutes);
app.use('/api/gallery', galleryRoutes);

// ----------------------------------------------------
// MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS
// ----------------------------------------------------

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Middleware Global de Errores (incluyendo Multer)
app.use((err, req, res, next) => {
  console.error('🔴 Error del servidor:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. El límite máximo es de 5MB.' });
    }
    return res.status(400).json({ error: `Error de carga de archivo: ${err.message}` });
  }

  if (err.message && err.message.includes('Solo se permiten archivos de imagen')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// En entornos locales/tradicionales iniciamos el servidor con app.listen
// En Vercel Serverless, Vercel gestiona las peticiones importando la app exportada
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend HechoByGaby escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
