const fs = require('fs');
const path = require('path');
const GalleryItem = require('../models/GalleryItem');

/**
 * Función auxiliar para eliminar una imagen local del servidor
 */
function removeLocalFile(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  const fileName = path.basename(imagePath);
  const fullPath = path.join(__dirname, '..', 'uploads', fileName);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn('No se pudo eliminar el archivo de la galería:', fullPath, err.message);
    }
  });
}

/**
 * GET /api/gallery
 * Obtiene todas las fotos de la galería (con filtro opcional por categoría)
 */
exports.getGalleryItems = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const filter = {};

    if (categoria && categoria !== 'Todos') {
      filter.categoria = categoria;
    }

    const items = await GalleryItem.find(filter).sort({ orden: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/gallery
 * Sube una nueva foto a la galería (admite archivo vía Multer o URL externa)
 */
exports.createGalleryItem = async (req, res, next) => {
  try {
    const { titulo, descripcion, categoria, orden } = req.body;

    if (!titulo || !String(titulo).trim()) {
      if (req.file) removeLocalFile('/uploads/' + req.file.filename);
      return res.status(400).json({ error: 'El título de la foto es obligatorio' });
    }

    let imagenFinal = '';
    if (req.file) {
      imagenFinal = `/uploads/${req.file.filename}`;
    } else if (req.body.imagen && String(req.body.imagen).trim()) {
      imagenFinal = String(req.body.imagen).trim();
    } else {
      return res.status(400).json({ error: 'Debes subir un archivo de imagen o proporcionar una URL válida' });
    }

    const nuevoItem = new GalleryItem({
      titulo: String(titulo).trim(),
      descripcion: descripcion ? String(descripcion).trim() : '',
      imagen: imagenFinal,
      categoria: categoria || 'Tortas',
      orden: orden !== undefined && !isNaN(Number(orden)) ? Number(orden) : 0
    });

    await nuevoItem.save();
    res.status(201).json(nuevoItem);
  } catch (error) {
    if (req.file) removeLocalFile('/uploads/' + req.file.filename);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * DELETE /api/gallery/:id
 * Elimina una foto de la galería y borra el archivo físico si es local
 */
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Foto de galería no encontrada' });
    }

    // Si la imagen era un archivo subido localmente, la borramos del disco
    removeLocalFile(item.imagen);

    await GalleryItem.findByIdAndDelete(id);

    res.json({ mensaje: 'Foto de galería eliminada correctamente', id });
  } catch (error) {
    next(error);
  }
};
