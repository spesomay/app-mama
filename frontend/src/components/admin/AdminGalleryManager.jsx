import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} from '../../services/galleryService';
import { getProductImageUrl } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';

const CATEGORIAS_GALERIA = ['Tortas', 'Tartas', 'Cajas de Desayuno', 'Mesa Dulce'];

export default function AdminGalleryManager() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [editingItem, setEditingItem] = useState(null);

  // Estado del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Tortas');
  const [precio, setPrecio] = useState('');
  const [imageMode, setImageMode] = useState('file'); // 'file' o 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // Alertas / Feedback
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback({ type: '', text: '' });
    }, 4500);
  };

  const loadGallery = useCallback(() => {
    getGalleryItems()
      .then((data) => {
        setGalleryItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar la galería:', err);
        setLoading(false);
        showFeedback('error', 'No se pudieron cargar las fotos de la galería.');
      });
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Por favor seleccioná un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('error', 'La imagen supera los 10MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setFilePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setTitulo('');
    setDescripcion('');
    setCategoria('Tortas');
    setPrecio('');
    handleClearImage();
    setImageUrl('');
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setTitulo(item.titulo);
    setDescripcion(item.descripcion || '');
    setCategoria(item.categoria || 'Tortas');
    setPrecio(item.precio ? String(item.precio) : '');

    if (item.imagen) {
      setImageMode('url');
      setImageUrl(item.imagen);
    } else {
      setImageMode('file');
      setImageUrl('');
    }
    handleClearImage();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo.trim()) {
      showFeedback('error', 'El título de la foto o trabajo es obligatorio.');
      return;
    }

    if (imageMode === 'file' && !selectedFile && !editingItem) {
      showFeedback('error', 'Por favor seleccioná una foto desde tu dispositivo.');
      return;
    }

    if (imageMode === 'url' && !imageUrl.trim() && !editingItem) {
      showFeedback('error', 'Por favor ingresá la URL de la imagen.');
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('categoria', categoria);
      formData.append('precio', precio ? Number(precio) : 0);

      if (imageMode === 'file' && selectedFile) {
        formData.append('imagen', selectedFile);
      } else if (imageMode === 'url' && imageUrl.trim()) {
        formData.append('imagen', imageUrl.trim());
      } else if (editingItem && editingItem.imagen && !selectedFile) {
        formData.append('imagen', editingItem.imagen);
      }

      if (editingItem) {
        await updateGalleryItem(editingItem._id, formData);
        showFeedback('success', '¡Foto y datos de la galería actualizados con éxito en MongoDB!');
      } else {
        await createGalleryItem(formData);
        showFeedback('success', '¡Foto guardada con éxito en la galería de MongoDB Atlas!');
      }

      resetForm();
      loadGallery();
    } catch (err) {
      console.error('Error al guardar foto:', err);
      const msg = err.response?.data?.error || err.message || 'Error al guardar la foto.';
      showFeedback('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, fotoTitulo) => {
    const confirm = window.confirm(`¿Estás segura de eliminar permanentemente la foto "${fotoTitulo}" de la galería?`);
    if (!confirm) return;

    try {
      await deleteGalleryItem(id);
      showFeedback('success', `Foto "${fotoTitulo}" eliminada correctamente.`);
      if (editingItem && editingItem._id === id) {
        resetForm();
      }
      loadGallery();
    } catch (err) {
      console.error('Error al eliminar foto:', err);
      showFeedback('error', err.response?.data?.error || 'No se pudo eliminar la foto.');
    }
  };

  const itemsFiltrados = galleryItems.filter(
    (item) => categoriaFiltro === 'Todos' || item.categoria === categoriaFiltro
  );

  return (
    <div>
      {/* ALERTA DE FEEDBACK */}
      {feedback.text && (
        <div
          style={{
            background: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
            border: `1px solid ${feedback.type === 'error' ? '#f87171' : '#86efac'}`,
            color: feedback.type === 'error' ? '#b91c1c' : '#15803d',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{feedback.type === 'error' ? '⚠️' : '✅'} {feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* FORMULARIO DE SUBIDA / EDICIÓN */}
      <div
        style={{
          backgroundColor: 'var(--blanco-card)',
          border: '1px solid var(--rosa-borde)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontFamily: 'Georgia, serif', color: 'var(--texto-oscuro)', fontSize: '1.25rem' }}>
            {editingItem ? `✏️ Editando Foto: ${editingItem.titulo}` : '📸 Subir Nueva Foto a la Galería'}
          </h3>
          {editingItem && (
            <button
              type="button"
              onClick={resetForm}
              className="boton-admin-link"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Título */}
            <div className="campo-formulario">
              <label className="label-formulario">Título del Trabajo / Torta *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Torta Drip Cake con Flores"
                className="input-formulario"
                required
              />
            </div>

            {/* Categoría */}
            <div className="campo-formulario">
              <label className="label-formulario">Categoría *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input-formulario"
              >
                {CATEGORIAS_GALERIA.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Precio de Referencia */}
            <div className="campo-formulario">
              <label className="label-formulario">Precio de Referencia ($ ARS)</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej. 18500 (Opcional)"
                className="input-formulario"
                min="0"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="campo-formulario">
            <label className="label-formulario">Descripción del Trabajo (Opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles del bizcochuelo, rellenos, ocasión o temáticas..."
              className="input-formulario"
              rows="2"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Selector de Imagen */}
          <div className="campo-formulario">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="label-formulario" style={{ marginBottom: 0 }}>Foto del Trabajo *</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  style={{
                    border: 'none',
                    background: imageMode === 'file' ? 'var(--rosa-suave)' : 'transparent',
                    color: imageMode === 'file' ? 'var(--rosa-principal)' : 'var(--texto-gris)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📁 Subir Archivo
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  style={{
                    border: 'none',
                    background: imageMode === 'url' ? 'var(--rosa-suave)' : 'transparent',
                    color: imageMode === 'url' ? 'var(--rosa-principal)' : 'var(--texto-gris)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔗 URL Web
                </button>
              </div>
            </div>

            {imageMode === 'file' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input-formulario"
                  style={{ padding: '0.5rem' }}
                />
                {filePreview && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={filePreview}
                      alt="Previsualización"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--rosa-borde)' }}
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      style={{ color: '#b91c1c', background: 'none', border: 'none', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Quitar foto
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto-torta.jpg"
                  className="input-formulario"
                />
                {imageUrl && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <img
                      src={imageUrl}
                      alt="Previsualización URL"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--rosa-borde)' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón de Enviar */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="boton-admin-link"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-btn-ingresar"
              style={{ width: 'auto', padding: '0.6rem 1.75rem', minHeight: '44px' }}
            >
              {isSubmitting ? 'Guardando en MongoDB...' : (editingItem ? '💾 Guardar Cambios' : '📸 Publicar en Galería')}
            </button>
          </div>
        </form>
      </div>

      {/* FILTROS POR CATEGORÍA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ color: 'var(--texto-oscuro)', fontSize: '1.1rem', margin: 0 }}>
          Fotos Publicadas ({itemsFiltrados.length})
        </h4>

        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {['Todos', ...CATEGORIAS_GALERIA].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaFiltro(cat)}
              style={{
                border: '1px solid',
                borderColor: categoriaFiltro === cat ? 'var(--rosa-principal)' : 'var(--rosa-borde)',
                backgroundColor: categoriaFiltro === cat ? 'var(--rosa-principal)' : 'var(--blanco-card)',
                color: categoriaFiltro === cat ? '#ffffff' : 'var(--texto-oscuro)',
                padding: '0.3rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA EN CUADRÍCULA */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-gris)' }}>
          Cargando fotos de la galería...
        </div>
      ) : itemsFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: 'var(--blanco-card)', borderRadius: '16px', border: '1px dashed var(--rosa-borde)' }}>
          <p style={{ color: 'var(--texto-gris)', fontSize: '0.95rem' }}>No hay fotos en esta categoría.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {itemsFiltrados.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: 'var(--blanco-card)',
                border: '1px solid var(--rosa-borde)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '170px', backgroundColor: 'var(--rosa-suave)' }}>
                <img
                  src={getProductImageUrl(item.imagen)}
                  alt={item.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    color: 'var(--rosa-principal)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {item.categoria}
                </span>

                {item.precio > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '8px'
                    }}
                  >
                    Ref: {formatPrice(item.precio)}
                  </span>
                )}
              </div>

              <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ color: 'var(--texto-oscuro)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                    {item.titulo}
                  </h4>
                  {item.descripcion && (
                    <p style={{ color: 'var(--texto-gris)', fontSize: '0.8rem', lineHeight: '1.3', marginBottom: '0.6rem' }}>
                      {item.descripcion}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--rosa-suave)', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="boton-admin-link"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.4rem', minHeight: '34px' }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id, item.titulo)}
                    className="boton-admin-logout"
                    style={{ padding: '0.4rem 0.75rem', minHeight: '34px' }}
                    title="Eliminar foto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
