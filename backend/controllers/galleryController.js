const fs = require('fs');
const path = require('path');
const GalleryItem = require('../models/GalleryItem');

function removeLocalFile(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  try {
    const fileName = path.basename(imagePath);
    const fullPath = path.join(__dirname, '..', 'uploads', fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, () => {});
    }
  } catch (err) {
    // Silencioso en entornos serverless
  }
}

// Trabajos iniciales para la galería de respaldo
const INITIAL_GALLERY_ITEMS = [
  {
    titulo: 'Torta Drip de Chocolate y Frutillas',
    descripcion: 'Bizcochuelo húmedo de chocolate con doble relleno de dulce de leche y baño drip de chocolate semiamargo.',
    categoria: 'Tortas',
    precio: 18500,
    imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    orden: 1
  },
  {
    titulo: 'Lemon Pie Clásico Artesanal',
    descripcion: 'Masa sablée crocante de manteca, suave curd de limón fresco y corona de merengue italiano flameado.',
    categoria: 'Tartas',
    precio: 9500,
    imagen: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    orden: 2
  },
  {
    titulo: 'Caja Desayuno Premium Cumpleaños',
    descripcion: 'Caja personalizada con taza esmaltada, café gourmet, sándwiches de miga triples, muffin y tarjeta caligrafiada.',
    categoria: 'Cajas de Desayuno',
    precio: 22000,
    imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    orden: 3
  },
  {
    titulo: 'Mesa Dulce: Shots y Mini Rogel',
    descripcion: 'Selección de vasitos de chocotorta, mini tartas toffy, alfajores de maicena y bocados individuales para eventos.',
    categoria: 'Mesa Dulce',
    precio: 35000,
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    orden: 4
  },
  {
    titulo: 'Tarta Frutillas con Crema Pastelera',
    descripcion: 'Fondo de masa crocante, generosa crema pastelera aromatizada con vainilla y frutillas frescas de estación.',
    categoria: 'Tartas',
    precio: 11000,
    imagen: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    orden: 5
  },
  {
    titulo: 'Torta Buttercream Floral Elegante',
    descripcion: 'Diseño en buttercream texturado con degradé pastel y detalles florales para celebraciones especiales.',
    categoria: 'Tortas',
    precio: 21000,
    imagen: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    orden: 6
  }
];

/**
 * GET /api/gallery
 * Obtiene las fotos de la galería (con filtro opcional por categoría)
 */
exports.getGalleryItems = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const filter = {};

    if (categoria && categoria !== 'Todos') {
      filter.categoria = categoria;
    }

    let items = await GalleryItem.find(filter).sort({ orden: 1, createdAt: -1 });

    // Si la colección está vacía, sembramos con las muestras iniciales
    if (items.length === 0 && (!categoria || categoria === 'Todos')) {
      await GalleryItem.insertMany(INITIAL_GALLERY_ITEMS);
      items = await GalleryItem.find(filter).sort({ orden: 1, createdAt: -1 });
    }

    res.json(items);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/gallery
 * Sube una nueva foto a la galería (soporta archivo en buffer Base64 o URL externa)
 */
exports.createGalleryItem = async (req, res, next) => {
  try {
    const { titulo, descripcion, categoria, precio, orden } = req.body;

    if (!titulo || !String(titulo).trim()) {
      return res.status(400).json({ error: 'El título de la foto o trabajo es obligatorio' });
    }

    let imagenFinal = '';
    if (req.file && req.file.buffer) {
      imagenFinal = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
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
      precio: precio !== undefined && !isNaN(Number(precio)) ? Number(precio) : 0,
      orden: orden !== undefined && !isNaN(Number(orden)) ? Number(orden) : 0
    });

    await nuevoItem.save();
    res.status(201).json(nuevoItem);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PUT /api/gallery/:id
 * Actualiza los datos de una foto de la galería (permite editar título, descripción, categoría, precio o cambiar foto)
 */
exports.updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Foto de galería no encontrada' });
    }

    const { titulo, descripcion, categoria, precio, orden } = req.body;

    if (titulo !== undefined) {
      if (!String(titulo).trim()) {
        return res.status(400).json({ error: 'El título no puede estar vacío' });
      }
      item.titulo = String(titulo).trim();
    }

    if (descripcion !== undefined) {
      item.descripcion = String(descripcion).trim();
    }

    if (categoria !== undefined) {
      item.categoria = categoria;
    }

    if (precio !== undefined) {
      if (isNaN(Number(precio)) || Number(precio) < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a cero' });
      }
      item.precio = Number(precio);
    }

    if (orden !== undefined && !isNaN(Number(orden))) {
      item.orden = Number(orden);
    }

    // Actualización de foto si se sube archivo o envía nueva URL
    if (req.file && req.file.buffer) {
      removeLocalFile(item.imagen);
      item.imagen = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.imagen && String(req.body.imagen).trim() !== item.imagen) {
      removeLocalFile(item.imagen);
      item.imagen = String(req.body.imagen).trim();
    }

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * DELETE /api/gallery/:id
 * Elimina una foto de la galería
 */
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await GalleryItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Foto de galería no encontrada' });
    }

    removeLocalFile(item.imagen);
    await GalleryItem.findByIdAndDelete(id);

    res.json({ mensaje: 'Foto de galería eliminada correctamente', id });
  } catch (error) {
    next(error);
  }
};
