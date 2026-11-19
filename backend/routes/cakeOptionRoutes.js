const express = require('express');
const router = express.Router();
const cakeOptionController = require('../controllers/cakeOptionController');

router.get('/', cakeOptionController.getCakeOptions);
router.post('/', cakeOptionController.createCakeOption);
router.put('/:id', cakeOptionController.updateCakeOption);
router.delete('/:id', cakeOptionController.deleteCakeOption);

module.exports = router;
