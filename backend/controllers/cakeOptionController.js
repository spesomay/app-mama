const CakeOption = require('../models/CakeOption');

const INITIAL_CAKE_OPTIONS = [
  // 1. Tamaños / Porciones (con maxRellenos configurable)
  { tipo: 'tamano', nombre: 'Chica (8 - 10 porciones)', precio: 14000, maxRellenos: 1, descripcion: 'Ideal para festejos íntimos de hasta 10 personas', orden: 1 },
  { tipo: 'tamano', nombre: 'Mediana (15 - 20 porciones)', precio: 20000, maxRellenos: 2, descripcion: 'Tamaño estándar para cumpleaños familiares', orden: 2 },
  { tipo: 'tamano', nombre: 'Grande (25 - 30 porciones)', precio: 28000, maxRellenos: 3, descripcion: 'Para grandes celebraciones y eventos', orden: 3 },

  // 2. Estilos de Cobertura
  { tipo: 'estilo', nombre: 'Drip Cake', precio: 3000, descripcion: 'Goteo artesanal de chocolate con detalles superiores', orden: 1 },
  { tipo: 'estilo', nombre: 'Buttercream Liso', precio: 1500, descripcion: 'Acabado suave, prolijo y clásico', orden: 2 },
  { tipo: 'estilo', nombre: 'Naked Cake (Rústico)', precio: 0, descripcion: 'Capas de bizcochuelo y relleno a la vista', orden: 3 },
  { tipo: 'estilo', nombre: 'Decoración Temática / Fondant', precio: 5000, descripcion: 'Modelados en pasta de azúcar personalizados', orden: 4 },

  // 3. Bizcochuelos
  { tipo: 'bizcochuelo', nombre: 'Vainilla Tradicional Húmedo', precio: 0, descripcion: 'Aromatizado con chaucha de vainilla', orden: 1 },
  { tipo: 'bizcochuelo', nombre: 'Chocolate Intenso', precio: 1500, descripcion: 'Cacao amargo seleccionado de alta calidad', orden: 2 },
  { tipo: 'bizcochuelo', nombre: 'Red Velvet', precio: 2500, descripcion: 'Clásico terciopelo rojo con toque sutil de cacao', orden: 3 },
  { tipo: 'bizcochuelo', nombre: 'Marmolado Vainilla y Cacao', precio: 1200, descripcion: 'Combinación clásica de vainilla y chocolate', orden: 4 },

  // 4. Rellenos
  { tipo: 'relleno', nombre: 'Dulce de Leche Clásico Artesanal', precio: 0, descripcion: 'Dulce de leche repostero premium', orden: 1 },
  { tipo: 'relleno', nombre: 'Dulce de Leche con Merenguitos', precio: 1200, descripcion: 'Crocantes merenguitos caseros', orden: 2 },
  { tipo: 'relleno', nombre: 'Nutella y Avellanas Tostadas', precio: 2500, descripcion: 'Pasta de avellanas con trozos crocantes', orden: 3 },
  { tipo: 'relleno', nombre: 'Crema Bariloche', precio: 1800, descripcion: 'Fusión de dulce de leche con chocolate cobertura', orden: 4 },
  { tipo: 'relleno', nombre: 'Crema Oreo', precio: 1500, descripcion: 'Crema suave con abundantes galletitas Oreo trituradas', orden: 5 },
  { tipo: 'relleno', nombre: 'Frutos Rojos y Crema', precio: 2000, descripcion: 'Compota artesanal de moras, frambuesas y arándanos', orden: 6 },
  { tipo: 'relleno', nombre: 'Chocotorta Especial', precio: 1600, descripcion: 'El clásico relleno cremoso argentino', orden: 7 }
];

/**
 * GET /api/cake-options
 */
exports.getCakeOptions = async (req, res, next) => {
  try {
    const { tipo, disponible } = req.query;
    const filter = {};

    if (tipo) {
      filter.tipo = tipo;
    }

    if (disponible !== undefined && disponible !== '') {
      filter.disponible = disponible === 'true' || disponible === true;
    }

    let options = await CakeOption.find(filter).sort({ orden: 1, createdAt: 1 });

    // Si la colección está vacía, sembramos con las opciones por defecto
    if (options.length === 0 && !tipo && disponible === undefined) {
      await CakeOption.insertMany(INITIAL_CAKE_OPTIONS);
      options = await CakeOption.find(filter).sort({ orden: 1, createdAt: 1 });
    }

    // Si el cliente pide un tipo específico, devolvemos la lista directa
    if (tipo) {
      return res.json(options);
    }

    // Si pide todas las opciones sin filtro de tipo, devolvemos un objeto agrupado y la lista completa
    const grouped = {
      tamanos: options.filter((o) => o.tipo === 'tamano'),
      estilos: options.filter((o) => o.tipo === 'estilo'),
      bizcochuelos: options.filter((o) => o.tipo === 'bizcochuelo'),
      rellenos: options.filter((o) => o.tipo === 'relleno'),
      todas: options
    };

    res.json(grouped);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cake-options
 */
exports.createCakeOption = async (req, res, next) => {
  try {
    const { tipo, nombre, precio, maxRellenos, descripcion, disponible, orden } = req.body;

    if (!tipo || !['tamano', 'estilo', 'bizcochuelo', 'relleno'].includes(tipo)) {
      return res.status(400).json({ error: 'El tipo es inválido. Debe ser: tamano, estilo, bizcochuelo o relleno' });
    }

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: 'El nombre de la opción es obligatorio' });
    }

    if (precio === undefined || isNaN(Number(precio)) || Number(precio) < 0) {
      return res.status(400).json({ error: 'El precio es obligatorio y no puede ser negativo' });
    }

    const nuevaOpcion = new CakeOption({
      tipo,
      nombre: String(nombre).trim(),
      precio: Number(precio),
      maxRellenos: tipo === 'tamano' && maxRellenos !== undefined ? Math.max(1, Number(maxRellenos)) : 1,
      descripcion: descripcion ? String(descripcion).trim() : '',
      disponible: disponible !== undefined ? (disponible === 'true' || disponible === true) : true,
      orden: orden !== undefined && !isNaN(Number(orden)) ? Number(orden) : 0
    });

    await nuevaOpcion.save();
    res.status(201).json(nuevaOpcion);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PUT /api/cake-options/:id
 */
exports.updateCakeOption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const option = await CakeOption.findById(id);

    if (!option) {
      return res.status(404).json({ error: 'Opción de torta no encontrada' });
    }

    const { nombre, precio, maxRellenos, descripcion, disponible, orden, tipo } = req.body;

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        return res.status(400).json({ error: 'El nombre no puede estar vacío' });
      }
      option.nombre = String(nombre).trim();
    }

    if (tipo !== undefined && ['tamano', 'estilo', 'bizcochuelo', 'relleno'].includes(tipo)) {
      option.tipo = tipo;
    }

    if (precio !== undefined) {
      if (isNaN(Number(precio)) || Number(precio) < 0) {
        return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a cero' });
      }
      option.precio = Number(precio);
    }

    if (maxRellenos !== undefined && !isNaN(Number(maxRellenos))) {
      option.maxRellenos = Math.max(1, Number(maxRellenos));
    }

    if (descripcion !== undefined) {
      option.descripcion = String(descripcion).trim();
    }

    if (disponible !== undefined) {
      option.disponible = disponible === 'true' || disponible === true;
    }

    if (orden !== undefined && !isNaN(Number(orden))) {
      option.orden = Number(orden);
    }

    const updated = await option.save();
    res.json(updated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * DELETE /api/cake-options/:id
 */
exports.deleteCakeOption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const option = await CakeOption.findByIdAndDelete(id);

    if (!option) {
      return res.status(404).json({ error: 'Opción de torta no encontrada' });
    }

    res.json({ mensaje: 'Opción de torta eliminada correctamente', id });
  } catch (error) {
    next(error);
  }
};
