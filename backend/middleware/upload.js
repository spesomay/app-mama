const multer = require('multer');

// Almacenamiento en memoria RAM: Las imágenes se procesan en buffer
// y se guardan como Base64 Data URI directamente en MongoDB Atlas.
// Esto garantiza persistencia permanente en Render y compatibilidad 100% con Vercel Serverless.
const storage = multer.memoryStorage();

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
    fileSize: 10 * 1024 * 1024 // 10 MB máximo para fotos de celulares de alta resolución
  }
});

module.exports = upload;
