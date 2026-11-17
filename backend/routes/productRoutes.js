const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const productController = require('../controllers/productController');

// Obtener todos los productos (con filtros opcionales ?categoria=&search=&disponible=)
router.get('/', productController.getProducts);

// Obtener un producto por ID
router.get('/:id', productController.getProductById);

// Crear un nuevo producto (acepta campo 'imagen' como archivo o en req.body)
router.post('/', upload.single('imagen'), productController.createProduct);

// Actualizar un producto existente
router.put('/:id', upload.single('imagen'), productController.updateProduct);

// Eliminar un producto
router.delete('/:id', productController.deleteProduct);

module.exports = router;
