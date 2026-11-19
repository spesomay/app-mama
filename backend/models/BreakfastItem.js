const mongoose = require('mongoose');

const breakfastItemSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del ítem de desayuno es obligatorio'],
    trim: true,
    maxlength: [120, 'El nombre no puede exceder los 120 caracteres']
  },
  subcategoria: {
    type: String,
    required: [true, 'La subcategoría es obligatoria'],
    enum: {
      values: ['Dulces', 'Salados', 'Infusiones', 'Mini Tortas', 'Detalles', 'Bebidas'],
      message: 'Subcategoría no válida. Debe ser Dulces, Salados, Infusiones, Mini Tortas, Detalles o Bebidas'
    },
    default: 'Dulces'
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  descripcion: {
    type: String,
    trim: true,
    default: ''
  },
  imagen: {
    type: String,
    default: ''
  },
  emoji: {
    type: String,
    default: '🧁'
  },
  disponible: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BreakfastItem', breakfastItemSchema);
