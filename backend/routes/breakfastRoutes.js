const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const breakfastController = require('../controllers/breakfastController');

router.get('/', breakfastController.getBreakfastItems);
router.get('/:id', breakfastController.getBreakfastItemById);
router.post('/', upload.single('imagen'), breakfastController.createBreakfastItem);
router.put('/:id', upload.single('imagen'), breakfastController.updateBreakfastItem);
router.delete('/:id', breakfastController.deleteBreakfastItem);

module.exports = router;
