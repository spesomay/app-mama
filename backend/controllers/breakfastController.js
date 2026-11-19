const BreakfastItem = require('../models/BreakfastItem');

// Datos iniciales de siembra para que el catálogo de desayunos tenga productos inmediatos
const INITIAL_BREAKFAST_ITEMS = [
  { nombre: 'Café de Especialidad / Cappuccino', subcategoria: 'Infusiones', precio: 1800, emoji: '☕', descripcion: 'En frasco hermético listo para disfrutar', orden: 1 },
  { nombre: 'Té en Hebras Gourmet', subcategoria: 'Infusiones', precio: 2000, emoji: '🫖', descripcion: 'Selección en hebras de frutos rojos o menta', orden: 2 },
  { nombre: 'Jugo Natural de Naranja 500ml', subcategoria: 'Infusiones', precio: 1600, emoji: '🍊', descripcion: 'Exprimido fresco del día en botella de vidrio', orden: 3 },
  { nombre: 'Medialuna de Manteca', subcategoria: 'Dulces', precio: 800, emoji: '🥐', descripcion: 'Elaborada artesanalmente con pura manteca', orden: 4 },
  { nombre: 'Muffin de Arándanos y Limón', subcategoria: 'Dulces', precio: 1500, emoji: '🧁', descripcion: 'Masa húmeda con arándanos frescos', orden: 5 },
  { nombre: 'Mini Lemon Pie Artesanal', subcategoria: 'Mini Tortas', precio: 2200, emoji: '🍋', descripcion: 'Masa crocante con crema suave y merengue', orden: 6 },
  { nombre: 'Mini Tarta Toffy', subcategoria: 'Mini Tortas', precio: 2200, emoji: '🍫', descripcion: 'Abundante dulce de leche y ganache', orden: 7 },
  { nombre: 'Alfajor Marplatense de Chocolate', subcategoria: 'Dulces', precio: 1300, emoji: '🍪', descripcion: 'Relleno de dulce de leche bañado en chocolate', orden: 8 },
  { nombre: 'Sándwich de Miga Jamón y Queso', subcategoria: 'Salados', precio: 900, emoji: '🥪', descripcion: 'Pan de miga extra tierno seleccionado', orden: 9 },
  { nombre: 'Croissant de Jamón Crudo y Queso', subcategoria: 'Salados', precio: 2600, emoji: '🥐', descripcion: 'Hojaldre artesanal con jamón crudo', orden: 10 },
  { nombre: 'Taza de Cerámica HechoByGaby', subcategoria: 'Detalles', precio: 3800, emoji: '☕', descripcion: 'Taza de cerámica esmaltada exclusiva', orden: 11 },
  { nombre: 'Caja con 4 Bombones Artesanales', subcategoria: 'Detalles', precio: 1900, emoji: '🍬', descripcion: 'Chocolates rellenos artesanales', orden: 12 }
];

/**
 * GET /api/breakfast-items
 */
exports.getBreakfastItems = async (req, res, next) => {
  try {
    const { subcategoria, disponible } = req.query;
    const filter = {};

    if (subcategoria && subcategoria !== 'Todos') {
      filter.subcategoria = subcategoria;
    }

    if (disponible !== undefined && disponible !== '') {
      filter.disponible = disponible === 'true' || disponible === true;
    }

    let items = await BreakfastItem.find(filter).sort({ orden: 1, createdAt: 1 });

    // Si la base de datos está vacía, sembrar automáticamente con los datos por defecto
    if (items.length === 0 && (!subcategoria || subcategoria === 'Todos') && disponible === undefined) {
      await BreakfastItem.insertMany(INITIAL_BREAKFAST_ITEMS);
      items = await BreakfastItem.find(filter).sort({ orden: 1, createdAt: 1 });
    }

    res.json(items);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/breakfast-items/:id
 */
exports.getBreakfastItemById = async (req, res, next) => {
  try {
    const item = await BreakfastItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Ítem de desayuno no encontrado' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/breakfast-items
 */
exports.createBreakfastItem = async (req, res, next) => {
  try {
    const { nombre, subcategoria, precio, descripcion, emoji, disponible, orden } = req.body;

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: 'El nombre del ítem es obligatorio' });
    }

    if (precio === undefined || precio === null || precio === '' || isNaN(Number(precio)) || Number(precio) < 0) {
      return res.status(400).json({ error: 'El precio es obligatorio y debe ser un número mayor o igual a cero' });
    }

    // Procesar imagen (archivo en buffer Base64 o URL)
    let imagenFinal = '';
    if (req.file && req.file.buffer) {
      imagenFinal = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.imagen) {
      imagenFinal = String(req.body.imagen).trim();
    }

    const nuevoItem = new BreakfastItem({
      nombre: String(nombre).trim(),
      subcategoria: subcategoria || 'Dulces',
      precio: Number(precio),
      descripcion: descripcion ? String(descripcion).trim() : '',
      imagen: imagenFinal,
      emoji: emoji ? String(emoji).trim() : '🧁',
      disponible: disponible !== undefined ? (disponible === 'true' || disponible === true) : true,
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
 * PUT /api/breakfast-items/:id
 */
exports.updateBreakfastItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await BreakfastItem.findById(id);

    if (!item) {
      return res.status(404).json({ error: 'Ítem de desayuno no encontrado' });
    }

    const { nombre, subcategoria, precio, descripcion, emoji, disponible, orden } = req.body;

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ error: 'El nombre no puede estar vacío' });
      }
      item.nombre = String(nombre).trim();
    }

    if (subcategoria !== undefined) {
      item.subcategoria = subcategoria;
    }

    if (precio !== undefined) {
      if (precio === '' || isNaN(Number(precio)) || Number(precio) < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a cero' });
      }
      item.precio = Number(precio);
    }

    if (descripcion !== undefined) {
      item.descripcion = String(descripcion).trim();
    }

    if (emoji !== undefined) {
      item.emoji = String(emoji).trim();
    }

    if (disponible !== undefined) {
      item.disponible = disponible === 'true' || disponible === true;
    }

    if (orden !== undefined && !isNaN(Number(orden))) {
      item.orden = Number(orden);
    }

    // Actualización de imagen si se subió un nuevo archivo o se envió URL
    if (req.file && req.file.buffer) {
      item.imagen = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.imagen !== undefined) {
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
 * DELETE /api/breakfast-items/:id
 */
exports.deleteBreakfastItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await BreakfastItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ error: 'Ítem de desayuno no encontrado' });
    }

    res.json({ mensaje: 'Ítem de desayuno eliminado correctamente', id });
  } catch (error) {
    next(error);
  }
};
