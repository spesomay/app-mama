const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);

let storage;

if (isVercel) {
  // En Vercel Serverless: almacenar en memoria (RAM)
  storage = multer.memoryStorage();
} else {
  // En desarrollo local o servidor persistente: intentar almacenamiento en disco
  const uploadDir = path.join(__dirname, '..', 'uploads');
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `prod-${uniqueSuffix}${ext}`);
      }
    });
  } catch (err) {
    // Si el sistema de archivos es de sólo lectura, recurrir a memoria
    console.warn('⚠️ Almacenamiento en disco no disponible, usando almacenamiento en memoria:', err.message);
    storage = multer.memoryStorage();
  }
}

// Filtro de validación de tipo de archivo (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WEBP, GIF, AVIF)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB máximo
  }
});

module.exports = upload;
