const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    maxlength: [120, 'El nombre no puede exceder los 120 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder los 1000 caracteres'],
    default: ''
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  categoria: {
    type: String,
    enum: {
      values: ['Tortas', 'Tartas', 'Desayunos', 'Varios'],
      message: 'Categoría no válida. Debe ser Tortas, Tartas, Desayunos o Varios'
    },
    default: 'Tortas'
  },
  imagen: {
    type: String,
    default: ''
  },
  opciones: {
    type: [String],
    default: []
  },
  disponible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
