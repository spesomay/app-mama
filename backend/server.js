const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();

// Configuración de CORS
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares para procesar JSON y formularios URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta de imágenes subidas de manera estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('🔴 ERROR CRÍTICO: MONGO_URI no está definido en el archivo .env');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('🟢 Conectado con éxito a MongoDB Atlas (hechobygaby)'))
    .catch((err) => console.error('🔴 Error de conexión con MongoDB Atlas:', err.message));
}

// ----------------------------------------------------
// RUTAS PRINCIPALES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend HechoByGaby escuchando en http://localhost:${PORT}`);
});
