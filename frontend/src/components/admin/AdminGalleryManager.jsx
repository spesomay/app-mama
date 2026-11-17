import { useState, useEffect, useRef, useCallback } from 'react';
import { getGalleryItems, createGalleryItem, deleteGalleryItem } from '../../services/galleryService';
import { getProductImageUrl } from '../../services/productService';
import { formatDate } from '../../utils/formatters';

export default function AdminGalleryManager() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');

  // Estado del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Tortas');
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

    if (file.size > 5 * 1024 * 1024) {
      showFeedback('error', 'La imagen supera los 5MB.');
      return;
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      showFeedback('error', 'Ingresá un título o nombre para la foto.');
      return;
    }

    if (imageMode === 'file' && !selectedFile) {
      showFeedback('error', 'Debés seleccionar una imagen desde tu dispositivo.');
      return;
    }

    if (imageMode === 'url' && !imageUrl.trim()) {
      showFeedback('error', 'Debés ingresar una URL de imagen válida.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('categoria', categoria);

      if (imageMode === 'file') {
        formData.append('imagen', selectedFile);
      } else {
        formData.append('imagen', imageUrl.trim());
      }

      await createGalleryItem(formData);
      showFeedback('success', `¡Foto "${titulo.trim()}" publicada con éxito en la galería!`);

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setCategoria('Tortas');
      handleClearImage();
      loadGallery();
    } catch (err) {
      console.error('Error al subir a galería:', err);
      const msg = err.response?.data?.error || err.message || 'Error al guardar la foto.';
      showFeedback('error', `Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, itemTitulo) => {
    const confirmar = window.confirm(`¿Estás segura de eliminar permanentemente la foto "${itemTitulo}" de la galería?`);
    if (!confirmar) return;

    try {
      await deleteGalleryItem(id);
      showFeedback('success', `Foto "${itemTitulo}" eliminada de la galería.`);
      loadGallery();
    } catch (err) {
      console.error('Error al eliminar foto:', err);
      const msg = err.response?.data?.error || err.message;
      showFeedback('error', `Error al eliminar: ${msg}`);
    }
  };

  const filteredItems = galleryItems.filter(
    (item) => categoriaFiltro === 'Todos' || item.categoria === categoriaFiltro
  );

  const currentPreview = imageMode === 'file' ? filePreview : imageUrl;

  return (
    <div>
      {/* Alerta de Feedback */}
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

      {/* FORMULARIO DE CARGA DE FOTOS PARA LA GALERÍA */}
      <div className="tarjeta-paso" style={{ marginBottom: '2rem' }}>
        <h3 className="subtitulo-form" style={{ margin: 0, marginBottom: '0.5rem' }}>
          📷 Cargar Nueva Foto a la Galería de Trabajos
        </h3>
        <p style={{ color: 'var(--texto-gris)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Subí fotos de tus tortas terminadas, tartas o cajas de desayuno para que los clientes las vean en la pestaña de Trabajos Realizados.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* SELECCIÓN DE IMAGEN */}
          <div style={{ background: 'var(--rosa-fondo)', padding: '1.25rem', borderRadius: '14px', border: '1px dashed var(--rosa-borde)' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '0.6rem', color: 'var(--texto-oscuro)' }}>
              🖼️ Fotografía del Trabajo *
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`pestana ${imageMode === 'file' ? 'activa' : ''}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', border: '1px solid var(--rosa-borde)' }}
              >
                📁 Subir foto desde dispositivo
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`pestana ${imageMode === 'url' ? 'activa' : ''}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', border: '1px solid var(--rosa-borde)' }}
              >
                🔗 Pegar enlace URL
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
                      Formatos soportados: JPG, PNG, WEBP (Hasta 5MB).
                    </small>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/fotos/torta-chocolate.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="campo-texto"
                      style={{ background: 'white' }}
                    />
                    <small style={{ color: 'var(--texto-gris)', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                      Enlace directo a una imagen de la web o red social.
                    </small>
                  </div>
                )}
              </div>

              {/* Vista previa miniatura */}
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

          {/* DATOS DE LA FOTO */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="campo-grupo">
              <label>Título o Nombre del Trabajo *</label>
              <input
                type="text"
                placeholder="Ej: Torta Drip Cake Rosas y Macarons"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="campo-texto"
                required
              />
            </div>

            <div className="campo-grupo">
              <label>Categoría en Galería *</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="campo-texto"
              >
                <option value="Tortas">🎂 Tortas Decoradas</option>
                <option value="Tartas">🥧 Tartas y Pies</option>
                <option value="Desayunos">☕ Cajas de Desayuno</option>
                <option value="Eventos">🎉 Cumpleaños y Eventos</option>
                <option value="Varios">🧁 Mesas Dulces / Varios</option>
              </select>
            </div>
          </div>

          <div className="campo-grupo">
            <label>Descripción o historia del trabajo (opcional)</label>
            <textarea
              placeholder="Ej: Bizcochuelo húmedo de vainilla con relleno de dulce de leche con nueces y cobertura de buttercream rosa para los 15 de Sofía..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="campo-texto"
              rows="2"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="boton-confirmar"
            style={{
              width: 'auto',
              alignSelf: 'flex-start',
              padding: '0.85rem 2rem',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? '⏳ Subiendo foto...' : '📷 Publicar Foto en la Galería'}
          </button>
        </form>
      </div>

      {/* GRILLA DE FOTOS ACTUALES EN LA GALERÍA */}
      <div className="tarjeta-paso">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="subtitulo-form" style={{ margin: 0 }}>
              🖼️ Fotos en la Galería ({filteredItems.length} de {galleryItems.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', margin: '2px 0 0 0' }}>
              Estas imágenes se muestran a los clientes en la pestaña "Galería".
            </p>
          </div>

          <button
            onClick={loadGallery}
            className="btn-sumar-restar"
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '14px' }}
            type="button"
          >
            🔄 Actualizar fotos
          </button>
        </div>

        {/* Filtro por Categorías */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {['Todos', 'Tortas', 'Tartas', 'Desayunos', 'Eventos', 'Varios'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoriaFiltro(cat)}
              className={`pestana ${categoriaFiltro === cat ? 'activa' : ''}`}
              style={{
                border: '1px solid var(--rosa-borde)',
                borderRadius: '20px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px 0', color: 'var(--texto-gris)' }}>Cargando galería...</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--texto-gris)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>📷 Aún no hay fotos en esta categoría.</p>
            <small>Cargá tu primera creación usando el formulario de arriba.</small>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {filteredItems.map((item) => {
              const fullImageUrl = getProductImageUrl(item.imagen);

              return (
                <div
                  key={item._id}
                  style={{
                    background: 'var(--blanco-card)',
                    border: '1px solid var(--rosa-borde)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--sombra-card)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div style={{ width: '100%', height: '170px', overflow: 'hidden', background: 'var(--rosa-fondo)', position: 'relative' }}>
                    <img
                      src={fullImageUrl}
                      alt={item.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerText = '🍰';
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        background: 'rgba(0,0,0,0.65)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {item.categoria}
                    </span>
                  </div>

                  <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Georgia, serif', color: 'var(--texto-oscuro)', fontSize: '0.95rem', margin: '0 0 4px 0' }}>
                        {item.titulo}
                      </h4>
                      {item.descripcion && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                          {item.descripcion}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--rosa-fondo)', paddingTop: '6px' }}>
                      <small style={{ color: 'var(--texto-gris)', fontSize: '0.7rem' }}>
                        {formatDate(item.createdAt)}
                      </small>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id, item.titulo)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        title="Eliminar de la galería"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
