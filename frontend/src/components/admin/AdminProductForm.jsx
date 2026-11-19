import { useState, useRef } from 'react';
import { formatPrice } from '../../utils/formatters';
import { getProductImageUrl } from '../../services/productService';

export default function AdminProductForm({ editingProduct, onSave, onCancelEdit, isSubmitting }) {
  // Inicialización directa basada en editingProduct (se resetea automáticamente vía key en el padre)
  const isExternalUrl =
    editingProduct?.imagen &&
    (editingProduct.imagen.startsWith('http://') || editingProduct.imagen.startsWith('https://'));

  const [nombre, setNombre] = useState(editingProduct?.nombre || '');
  const [descripcion, setDescripcion] = useState(editingProduct?.descripcion || '');
  const [precio, setPrecio] = useState(editingProduct?.precio !== undefined ? editingProduct.precio : '');
  const [categoria, setCategoria] = useState(editingProduct?.categoria || 'Tortas');
  const [disponible, setDisponible] = useState(editingProduct?.disponible !== undefined ? editingProduct.disponible : true);

  // Manejo de Opciones de Tamaño o Relleno (chips)
  const [opciones, setOpciones] = useState(
    Array.isArray(editingProduct?.opciones) ? editingProduct.opciones : []
  );
  const [nuevaOpcion, setNuevaOpcion] = useState('');

  // Manejo de Imagen: Archivo vs URL
  const [imageMode, setImageMode] = useState(isExternalUrl ? 'url' : 'file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(
    editingProduct?.imagen && !isExternalUrl ? getProductImageUrl(editingProduct.imagen) : ''
  );
  const [imageUrl, setImageUrl] = useState(isExternalUrl ? editingProduct.imagen : '');
  const fileInputRef = useRef(null);

  // Estado de errores de validación en el cliente
  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoria('Tortas');
    setDisponible(true);
    setOpciones([]);
    setNuevaOpcion('');
    setSelectedFile(null);
    setFilePreview('');
    setImageUrl('');
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manejo de carga de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Por favor seleccioná un archivo de imagen válido (JPG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('La imagen supera el tamaño máximo permitido de 5MB.');
      return;
    }

    setValidationError('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setFilePreview('');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manejo de chips de opciones (tamaños / rellenos)
  const handleAddOption = (e) => {
    e.preventDefault();
    const cleanOpt = nuevaOpcion.trim();
    if (!cleanOpt) return;
    if (opciones.includes(cleanOpt)) {
      setValidationError(`La opción "${cleanOpt}" ya fue agregada.`);
      return;
    }
    setOpciones([...opciones, cleanOpt]);
    setNuevaOpcion('');
    setValidationError('');
  };

  const handleRemoveOption = (optToRemove) => {
    setOpciones(opciones.filter((opt) => opt !== optToRemove));
  };

  // Presets rápidos para facilitar la carga a Gaby
  const addPresetOptions = (presets) => {
    const merged = Array.from(new Set([...opciones, ...presets]));
    setOpciones(merged);
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Validaciones
    if (!nombre.trim()) {
      setValidationError('Ingresá el nombre del producto.');
      return;
    }

    if (precio === '' || isNaN(Number(precio)) || Number(precio) < 0) {
      setValidationError('Ingresá un precio numérico válido (mayor o igual a cero).');
      return;
    }

    // Preparar FormData (para soportar archivo y campos de texto)
    const formData = new FormData();
    formData.append('nombre', nombre.trim());
    formData.append('descripcion', descripcion.trim());
    formData.append('precio', Number(precio));
    formData.append('categoria', categoria);
    formData.append('disponible', disponible);
    formData.append('opciones', JSON.stringify(opciones));

    if (imageMode === 'file' && selectedFile) {
      formData.append('imagen', selectedFile);
    } else if (imageMode === 'url' && imageUrl.trim()) {
      formData.append('imagen', imageUrl.trim());
    } else if (editingProduct && !selectedFile && !imageUrl) {
      // Mantener la imagen previa si no se cambió
      formData.append('imagen', editingProduct.imagen || '');
    }

    onSave(formData, resetForm);
  };

  return (
    <div className={`admin-card-formulario ${editingProduct ? 'editando' : ''}`}>
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-titulo">
            {editingProduct ? `✏️ Modificar: ${editingProduct.nombre}` : '➕ Cargar Nuevo Producto al Catálogo'}
          </h3>
          <p className="admin-card-subtitulo">
            Agregá o editá tortas, tartas y productos destacados para el catálogo principal de la tienda.
          </p>
        </div>
        {editingProduct && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="boton-admin-link"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            Cancelar Edición
          </button>
        )}
      </div>

      {validationError && (
        <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          ⚠️ {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* SECCIÓN 1: SELECCIÓN DE IMAGEN ESTILIZADA */}
        <div className="admin-media-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label className="label-formulario" style={{ margin: 0 }}>
              <span>🖼️ Imagen del Producto</span>
              <span className="label-hint">Tortas, Tartas o Cajas</span>
            </label>
            <div className="admin-modo-selector">
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`admin-modo-btn ${imageMode === 'file' ? 'activo' : ''}`}
              >
                📁 Subir Archivo
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`admin-modo-btn ${imageMode === 'url' ? 'activo' : ''}`}
              >
                🔗 Enlace Web
              </button>
            </div>
          </div>

          {imageMode === 'file' ? (
            <div>
              {!filePreview ? (
                <div
                  className="admin-file-picker-custom"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="admin-file-picker-icon">📸</span>
                  <span className="admin-file-picker-text">Tocá aquí para elegir una foto del producto</span>
                  <span className="admin-file-picker-hint">Formatos JPG, PNG, WebP (hasta 10MB)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="admin-file-input-hidden"
                  />
                </div>
              ) : (
                <div className="admin-preview-tarjeta">
                  <img
                    src={filePreview}
                    alt="Vista previa"
                    className="admin-preview-thumb"
                  />
                  <div className="admin-preview-info">
                    <span className="admin-preview-nombre">{selectedFile?.name || 'Foto del producto'}</span>
                    <span className="admin-preview-sub">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Listo para guardar'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="admin-preview-btn-quitar"
                  >
                    ✕ Quitar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="url"
                placeholder="https://ejemplo.com/fotos/torta-lemon-pie.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-formulario"
              />
              {imageUrl && (
                <div style={{ marginTop: '0.75rem' }}>
                  <img
                    src={imageUrl}
                    alt="Vista previa URL"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--rosa-borde)' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 2: DATOS PRINCIPALES EN GRILLA RESPONSIVA */}
        <div className="admin-form-grid">
          <div className="campo-formulario">
            <label className="label-formulario">
              <span>Nombre del Producto <span className="requerido">*</span></span>
            </label>
            <input
              type="text"
              placeholder="Ej: Drip Cake de Chocolate Intenso"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-formulario"
              required
            />
          </div>

          <div className="campo-formulario">
            <label className="label-formulario">
              <span>Categoría <span className="requerido">*</span></span>
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="input-formulario"
            >
              <option value="Tortas">🎂 Tortas</option>
              <option value="Tartas">🥧 Tartas</option>
              <option value="Desayunos">☕ Cajas de Desayuno</option>
              <option value="Varios">🧁 Varios / Especiales</option>
            </select>
          </div>

          <div className="campo-formulario campo-span-full">
            <label className="label-formulario">
              <span>Precio de Venta ($ ARS) <span className="requerido">*</span></span>
              {precio !== '' && !isNaN(Number(precio)) && (
                <span className="label-hint" style={{ color: 'var(--rosa-principal)', fontWeight: 'bold' }}>
                  {formatPrice(precio)}
                </span>
              )}
            </label>
            <input
              type="number"
              min="0"
              step="50"
              placeholder="Ej. 12000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="input-formulario"
              required
            />
          </div>

          {/* SECCIÓN 3: DESCRIPCIÓN DETALLADA (ANCHO COMPLETO) */}
          <div className="campo-formulario campo-span-full">
            <label className="label-formulario">
              <span>Descripción detallada</span>
              <span className="label-hint">Ingredientes, porciones estimadas y presentación</span>
            </label>
            <textarea
              placeholder="Describí los ingredientes, presentación, cantidad estimada de personas o detalles artesanales..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="input-formulario"
              rows="3"
            />
          </div>
        </div>

        {/* SECCIÓN 4: OPCIONES DINÁMICAS (TAMAÑOS, PORCIONES O RELLENOS) */}
        <div style={{ background: 'var(--rosa-fondo)', border: '1px solid var(--rosa-borde)', padding: '1.15rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label className="label-formulario" style={{ margin: 0 }}>
              <span>🍰 Opciones de Tamaño, Porciones o Rellenos disponibles:</span>
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => addPresetOptions(['Chica (8 - 10 porciones)', 'Mediana (12 - 15 porciones)', 'Grande (20 - 25 porciones)'])}
                className="btn-sumar-restar"
                style={{ width: 'auto', padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '12px' }}
                title="Cargar tamaños estándar"
              >
                + Tamaños estándar
              </button>
              <button
                type="button"
                onClick={() => addPresetOptions(['Dulce de Leche', 'Crema Oreo', 'Nutella y Avellanas', 'Crema Chantilly'])}
                className="btn-sumar-restar"
                style={{ width: 'auto', padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderRadius: '12px' }}
                title="Cargar rellenos populares"
              >
                + Rellenos típicos
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              placeholder="Ej: Chica (8 porciones) o Relleno Nutella"
              value={nuevaOpcion}
              onChange={(e) => setNuevaOpcion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption(e);
                }
              }}
              className="input-formulario"
              style={{ padding: '0.55rem 0.85rem' }}
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="boton-pedido"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', minHeight: 'auto' }}
            >
              + Agregar
            </button>
          </div>

          {/* Chips agregados */}
          {opciones.length === 0 ? (
            <small style={{ color: 'var(--texto-gris)', fontStyle: 'italic', display: 'block' }}>
              Sin opciones especiales configuradas.
            </small>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {opciones.map((opt) => (
                <span
                  key={opt}
                  style={{
                    background: 'var(--rosa-suave)',
                    border: '1px solid var(--rosa-borde)',
                    color: 'var(--rosa-principal)',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {opt}
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rosa-principal)', fontWeight: 'bold' }}
                    title="Eliminar opción"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN 5: DISPONIBILIDAD ESTILIZADA */}
        <label className="admin-checkbox-card" htmlFor="disponibleCheck">
          <input
            type="checkbox"
            id="disponibleCheck"
            checked={disponible}
            onChange={(e) => setDisponible(e.target.checked)}
            className="admin-checkbox-input"
          />
          <span className="admin-checkbox-label">
            Producto activo y disponible para pedidos inmediatos en la tienda
          </span>
        </label>

        {/* BOTONES DE ACCIÓN */}
        <div className="admin-form-acciones">
          {editingProduct && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="boton-admin-link"
              style={{ padding: '0.65rem 1.25rem' }}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="admin-btn-ingresar"
            style={{ width: 'auto', padding: '0.65rem 1.75rem', minHeight: '44px' }}
          >
            {isSubmitting
              ? '⏳ Guardando en MongoDB...'
              : editingProduct
              ? '💾 Actualizar Producto'
              : '➕ Guardar en Catálogo'}
          </button>
        </div>

      </form>
    </div>
  );
}
