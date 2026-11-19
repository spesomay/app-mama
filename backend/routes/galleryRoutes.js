const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const galleryController = require('../controllers/galleryController');

router.get('/', galleryController.getGalleryItems);
router.post('/', upload.single('imagen'), galleryController.createGalleryItem);
router.put('/:id', upload.single('imagen'), galleryController.updateGalleryItem);
router.delete('/:id', galleryController.deleteGalleryItem);

module.exports = router;
