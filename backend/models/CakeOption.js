const mongoose = require('mongoose');

const cakeOptionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: [true, 'El tipo de opción es obligatorio'],
    enum: {
      values: ['tamano', 'estilo', 'bizcochuelo', 'relleno'],
      message: 'Tipo de opción no válido. Debe ser: tamano, estilo, bizcochuelo o relleno'
    }
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la opción es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio base o adicional es obligatorio'],
    default: 0,
    min: [0, 'El precio no puede ser negativo']
  },
  maxRellenos: {
    type: Number,
    default: 1,
    min: [1, 'Debe permitir al menos 1 relleno']
  },
  descripcion: {
    type: String,
    trim: true,
    default: ''
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

module.exports = mongoose.model('CakeOption', cakeOptionSchema);
