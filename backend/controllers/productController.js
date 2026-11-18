const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

/**
 * Función auxiliar para parsear opciones recibidas como array, JSON string o texto separado por comas
 */
function parseOptions(opcionesRaw) {
  if (!opcionesRaw) return [];
  if (Array.isArray(opcionesRaw)) {
    return opcionesRaw.map((opt) => String(opt).trim()).filter(Boolean);
  }
  if (typeof opcionesRaw === 'string') {
    try {
      const parsed = JSON.parse(opcionesRaw);
      if (Array.isArray(parsed)) {
        return parsed.map((opt) => String(opt).trim()).filter(Boolean);
      }
    } catch {
      // Si no es JSON válido, interpretamos como texto separado por comas
      return opcionesRaw
        .split(',')
        .map((opt) => opt.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/**
 * Función auxiliar para eliminar una imagen local del servidor de forma segura
 */
function removeLocalFile(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) return;
  try {
    const fileName = path.basename(imagePath);
    const fullPath = path.join(__dirname, '..', 'uploads', fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.warn('No se pudo eliminar el archivo antiguo:', fullPath, err.message);
        }
      });
    }
  } catch (err) {
    // Silencioso en entornos serverless de sólo lectura
  }
}

// ----------------------------------------------------
// CONTROLADORES
// ----------------------------------------------------

/**
 * GET /api/products
 * Obtiene la lista de productos con soporte para filtros por categoría, búsqueda y disponibilidad
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { categoria, search, disponible } = req.query;
    const filter = {};

    if (categoria && categoria !== 'Todos') {
      filter.categoria = categoria;
    }

    if (disponible !== undefined && disponible !== '') {
      filter.disponible = disponible === 'true';
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ nombre: regex }, { descripcion: regex }];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Obtiene el detalle de un producto específico
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products
 * Crea un nuevo producto, soportando multipart/form-data (imagen de archivo) o JSON (imagen URL)
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, categoria, disponible } = req.body;

    // Validaciones básicas de campos obligatorios
    if (!nombre || !String(nombre).trim()) {
      // Si se subió un archivo pero falla la validación, lo borramos para no dejar basura
      if (req.file) removeLocalFile('/uploads/' + req.file.filename);
      return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
    }

    if (precio === undefined || precio === null || precio === '' || isNaN(Number(precio))) {
      if (req.file) removeLocalFile('/uploads/' + req.file.filename);
      return res.status(400).json({ error: 'El precio es obligatorio y debe ser un número válido' });
    }

    if (Number(precio) < 0) {
      if (req.file) removeLocalFile('/uploads/' + req.file.filename);
      return res.status(400).json({ error: 'El precio no puede ser negativo' });
    }

    // Determinar la imagen (archivo subido tiene prioridad sobre URL de texto)
    let imagenFinal = '';
    if (req.file) {
      if (req.file.buffer) {
        // En memoria (Vercel Serverless) -> Base64 Data URI
        imagenFinal = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (req.file.filename) {
        // En disco (Servidor local)
        imagenFinal = `/uploads/${req.file.filename}`;
      }
    } else if (req.body.imagen) {
      imagenFinal = String(req.body.imagen).trim();
    }

    // Parsear opciones de tamaño o relleno
    const opcionesParsed = parseOptions(req.body.opciones);

    const nuevoProducto = new Product({
      nombre: String(nombre).trim(),
      descripcion: descripcion ? String(descripcion).trim() : '',
      precio: Number(precio),
      categoria: categoria || 'Tortas',
      imagen: imagenFinal,
      opciones: opcionesParsed,
      disponible: disponible !== undefined ? (disponible === 'true' || disponible === true) : true
    });

    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    if (req.file) removeLocalFile('/uploads/' + req.file.filename);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Actualiza los datos de un producto (reemplazando imagen si se sube una nueva)
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      if (req.file) removeLocalFile('/uploads/' + req.file.filename);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { nombre, descripcion, precio, categoria, disponible } = req.body;

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        if (req.file) removeLocalFile('/uploads/' + req.file.filename);
        return res.status(400).json({ error: 'El nombre del producto no puede estar vacío' });
      }
      product.nombre = String(nombre).trim();
    }

    if (precio !== undefined) {
      if (precio === '' || isNaN(Number(precio)) || Number(precio) < 0) {
        if (req.file) removeLocalFile('/uploads/' + req.file.filename);
        return res.status(400).json({ error: 'El precio debe ser un número mayor o igual a cero' });
      }
      product.precio = Number(precio);
    }

    if (descripcion !== undefined) {
      product.descripcion = String(descripcion).trim();
    }

    if (categoria !== undefined) {
      product.categoria = categoria;
    }

    if (disponible !== undefined) {
      product.disponible = disponible === 'true' || disponible === true;
    }

    if (req.body.opciones !== undefined) {
      product.opciones = parseOptions(req.body.opciones);
    }

    // Manejo de reemplazo de imagen
    if (req.file) {
      // Si tenía una imagen local previa, eliminamos el archivo antiguo
      removeLocalFile(product.imagen);
      if (req.file.buffer) {
        // En memoria (Vercel Serverless) -> Base64 Data URI
        product.imagen = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (req.file.filename) {
        // En disco (Servidor local)
        product.imagen = `/uploads/${req.file.filename}`;
      }
    } else if (req.body.imagen !== undefined) {
      const nuevaUrl = String(req.body.imagen).trim();
      if (nuevaUrl !== product.imagen) {
        removeLocalFile(product.imagen);
        product.imagen = nuevaUrl;
      }
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    if (req.file) removeLocalFile('/uploads/' + req.file.filename);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Elimina un producto y su imagen asociada del disco si era un archivo local
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Si la imagen era un archivo subido localmente, la borramos del disco
    removeLocalFile(product.imagen);

    await Product.findByIdAndDelete(id);

    res.json({ mensaje: 'Producto eliminado correctamente', id });
  } catch (error) {
    next(error);
  }
};
