const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título de la foto o trabajo es obligatorio'],
    trim: true,
    maxlength: [120, 'El título no puede exceder los 120 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres'],
    default: ''
  },
  imagen: {
    type: String,
    required: [true, 'La imagen de la galería es obligatoria'],
    trim: true
  },
  categoria: {
    type: String,
    enum: {
      values: ['Tortas', 'Tartas', 'Desayunos', 'Eventos', 'Varios'],
      message: 'Categoría no válida. Debe ser Tortas, Tartas, Desayunos, Eventos o Varios'
    },
    default: 'Tortas'
  },
  orden: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
