const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const galleryController = require('../controllers/galleryController');

// Obtener todas las fotos de la galería
router.get('/', galleryController.getGalleryItems);

// Subir una nueva foto a la galería (acepta 'imagen' como archivo o en req.body)
router.post('/', upload.single('imagen'), galleryController.createGalleryItem);

// Eliminar una foto de la galería
router.delete('/:id', galleryController.deleteGalleryItem);

module.exports = router;
