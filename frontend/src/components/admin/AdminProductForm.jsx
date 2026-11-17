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

  // Determinar vista previa de imagen a mostrar
  const currentPreview = imageMode === 'file' ? filePreview : imageUrl;

  return (
    <div className="tarjeta-paso" style={{ border: editingProduct ? '2px solid var(--rosa-principal)' : '1px solid var(--rosa-borde)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className="subtitulo-form" style={{ margin: 0 }}>
          {editingProduct ? '✏️ Modificar Producto' : '➕ Cargar Nuevo Producto al Catálogo'}
        </h3>
        {editingProduct && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn-eliminar-item"
            style={{ fontSize: '0.85rem', color: 'var(--texto-gris)', textDecoration: 'underline' }}
          >
            Cancelar Edición
          </button>
        )}
      </div>

      {validationError && (
        <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          ⚠️ {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* SECCIÓN 1: SELECCIÓN DE IMAGEN CON VISTA PREVIA */}
        <div style={{ background: 'var(--rosa-fondo)', padding: '1.25rem', borderRadius: '14px', border: '1px dashed var(--rosa-borde)' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '0.6rem', color: 'var(--texto-oscuro)' }}>
            🖼️ Imagen del Producto (Tortas, Tartas o Cajas de Desayuno)
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <button
              type="button"
              onClick={() => setImageMode('file')}
              className={`pestana ${imageMode === 'file' ? 'activa' : ''}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', border: '1px solid var(--rosa-borde)' }}
            >
              📁 Subir desde mi dispositivo
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`pestana ${imageMode === 'url' ? 'activa' : ''}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', border: '1px solid var(--rosa-borde)' }}
            >
              🔗 Pegar enlace URL web
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: currentPreview ? '1fr 140px' : '1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              {imageMode === 'file' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="campo-texto"
                    style={{ background: 'white' }}
                  />
                  <small style={{ color: 'var(--texto-gris)', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                    Formatos soportados: JPG, PNG, WEBP. Máximo 5MB.
                  </small>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/fotos/torta-lemon-pie.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="campo-texto"
                    style={{ background: 'white' }}
                  />
                  <small style={{ color: 'var(--texto-gris)', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                    Pegá un enlace directo a una imagen de la web o de tus redes sociales.
                  </small>
                </div>
              )}
            </div>

            {/* Miniatura de vista previa */}
            {currentPreview && (
              <div style={{ position: 'relative', width: '130px', height: '110px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--rosa-principal)', background: 'white' }}>
                <img
                  src={currentPreview}
                  alt="Vista previa"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  title="Quitar imagen"
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(220, 38, 38, 0.85)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 2: DATOS PRINCIPALES (NOMBRE, CATEGORÍA, PRECIO) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="campo-grupo">
            <label>Nombre del Producto *</label>
            <input
              type="text"
              placeholder="Ej: Drip Cake de Chocolate Intenso"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="campo-texto"
              required
            />
          </div>

          <div className="campo-grupo">
            <label>Categoría *</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="campo-texto"
            >
              <option value="Tortas">🎂 Tortas</option>
              <option value="Tartas">🥧 Tartas</option>
              <option value="Desayunos">☕ Cajas de Desayuno</option>
              <option value="Varios">🧁 Varios / Especiales</option>
            </select>
          </div>

          <div className="campo-grupo">
            <label>Precio de Venta ($) *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="12000"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="campo-texto"
                required
              />
              {precio !== '' && !isNaN(Number(precio)) && (
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--rosa-principal)' }}>
                  {formatPrice(precio)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: DESCRIPCIÓN DETALLADA */}
        <div className="campo-grupo">
          <label>Descripción detallada del producto</label>
          <textarea
            placeholder="Describí los ingredientes, presentación, cantidad estimada de personas o detalles artesanales..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="campo-texto"
            rows="3"
          />
        </div>

        {/* SECCIÓN 4: OPCIONES DINÁMICAS (TAMAÑOS, PORCIONES O RELLENOS) */}
        <div style={{ background: 'var(--blanco-card)', border: '1px solid var(--rosa-borde)', padding: '1rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--texto-oscuro)' }}>
              🍰 Opciones de Tamaño, Porciones o Rellenos disponibles:
            </label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => addPresetOptions(['Chica (8 - 10 porciones)', 'Mediana (12 - 15 porciones)', 'Grande (20 - 25 porciones)'])}
                className="btn-sumar-restar"
                style={{ width: 'auto', padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}
                title="Cargar tamaños estándar"
              >
                + Tamaños estándar
              </button>
              <button
                type="button"
                onClick={() => addPresetOptions(['Dulce de Leche', 'Crema Oreo', 'Nutella y Avellanas', 'Crema Chantilly'])}
                className="btn-sumar-restar"
                style={{ width: 'auto', padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderRadius: '12px' }}
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
              className="campo-texto"
              style={{ padding: '0.5rem 0.85rem' }}
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="boton-confirmar"
              style={{ width: 'auto', marginTop: 0, padding: '0.5rem 1.25rem', whiteSpace: 'nowrap' }}
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

        {/* SECCIÓN 5: DISPONIBILIDAD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="disponibleCheck"
            checked={disponible}
            onChange={(e) => setDisponible(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--rosa-principal)' }}
          />
          <label htmlFor="disponibleCheck" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: '600' }}>
            Producto disponible para pedidos inmediatos en la tienda
          </label>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="boton-confirmar"
            style={{
              width: 'auto',
              padding: '0.85rem 2rem',
              backgroundColor: editingProduct ? '#2563eb' : 'var(--rosa-principal)',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting
              ? '⏳ Guardando en MongoDB...'
              : editingProduct
              ? '💾 Actualizar Producto'
              : '➕ Guardar Producto en MongoDB'}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={onCancelEdit}
              style={{
                background: 'transparent',
                border: '1px solid var(--rosa-borde)',
                padding: '0.85rem 1.5rem',
                borderRadius: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--texto-oscuro)'
              }}
            >
              Cancelar
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
