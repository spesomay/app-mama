import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getBreakfastItems,
  createBreakfastItem,
  updateBreakfastItem,
  deleteBreakfastItem
} from '../../services/breakfastService';
import { formatPrice } from '../../utils/formatters';

const SUBCATEGORIAS = ['Dulces', 'Salados', 'Infusiones', 'Mini Tortas', 'Detalles'];

export default function AdminBreakfastManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subcatFiltro, setSubcatFiltro] = useState('Todos');
  const [editingItem, setEditingItem] = useState(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [subcategoria, setSubcategoria] = useState('Dulces');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [emoji, setEmoji] = useState('🧁');
  const [disponible, setDisponible] = useState(true);
  const [imageMode, setImageMode] = useState('file'); // 'file' o 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef(null);

  // Feedback
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback({ type: '', text: '' });
    }, 4500);
  };

  const loadItems = useCallback(() => {
    getBreakfastItems()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar ítems de desayuno:', err);
        setLoading(false);
        showFeedback('error', 'No se pudieron cargar los ítems de desayuno.');
      });
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Seleccioná un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('error', 'La imagen no debe superar los 10MB.');
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
    setNombre('');
    setSubcategoria('Dulces');
    setPrecio('');
    setDescripcion('');
    setEmoji('🧁');
    setDisponible(true);
    handleClearImage();
    setImageUrl('');
  };

  const handleStartEdit = (item) => {
    setEditingItem(item);
    setNombre(item.nombre);
    setSubcategoria(item.subcategoria);
    setPrecio(item.precio);
    setDescripcion(item.descripcion || '');
    setEmoji(item.emoji || '🧁');
    setDisponible(item.disponible !== false);

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

    if (!nombre.trim()) {
      showFeedback('error', 'El nombre del ítem es obligatorio.');
      return;
    }

    if (precio === '' || isNaN(Number(precio)) || Number(precio) < 0) {
      showFeedback('error', 'Ingresá un precio válido mayor o igual a cero.');
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      formData.append('subcategoria', subcategoria);
      formData.append('precio', precio);
      formData.append('descripcion', descripcion.trim());
      formData.append('emoji', emoji.trim() || '🧁');
      formData.append('disponible', disponible);

      if (imageMode === 'file' && selectedFile) {
        formData.append('imagen', selectedFile);
      } else if (imageMode === 'url' && imageUrl.trim()) {
        formData.append('imagen', imageUrl.trim());
      } else if (editingItem && editingItem.imagen && !selectedFile) {
        formData.append('imagen', editingItem.imagen);
      }

      if (editingItem) {
        await updateBreakfastItem(editingItem._id, formData);
        showFeedback('success', `¡Ítem "${nombre}" actualizado con éxito en MongoDB!`);
      } else {
        await createBreakfastItem(formData);
        showFeedback('success', `¡Ítem "${nombre}" agregado con éxito al catálogo de desayunos!`);
      }

      resetForm();
      loadItems();
    } catch (err) {
      console.error('Error al guardar ítem de desayuno:', err);
      const msg = err.response?.data?.error || err.message || 'Error al guardar el ítem.';
      showFeedback('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, itemNombre) => {
    const confirm = window.confirm(`¿Estás segura de eliminar permanentemente "${itemNombre}"?`);
    if (!confirm) return;

    try {
      await deleteBreakfastItem(id);
      showFeedback('success', `Ítem "${itemNombre}" eliminado correctamente.`);
      if (editingItem && editingItem._id === id) {
        resetForm();
      }
      loadItems();
    } catch (err) {
      console.error('Error al eliminar ítem:', err);
      showFeedback('error', err.response?.data?.error || 'No se pudo eliminar el ítem.');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const formData = new FormData();
      formData.append('disponible', !item.disponible);
      await updateBreakfastItem(item._id, formData);
      loadItems();
      showFeedback('success', `"${item.nombre}" ahora está ${!item.disponible ? 'disponible' : 'pausado'}.`);
    } catch (err) {
      console.error('Error al cambiar disponibilidad:', err);
      showFeedback('error', 'No se pudo cambiar el estado.');
    }
  };

  const itemsFiltrados = items.filter(
    (item) => subcatFiltro === 'Todos' || item.subcategoria === subcatFiltro
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

      {/* FORMULARIO DE CARGA / EDICIÓN */}
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
            {editingItem ? `✏️ Editando: ${editingItem.nombre}` : '☕ Cargar Nuevo Ítem de Desayuno'}
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
            {/* Nombre */}
            <div className="campo-formulario">
              <label className="label-formulario">Nombre del Producto *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Medialuna con Dulce de Leche"
                className="input-formulario"
                required
              />
            </div>

            {/* Subcategoría */}
            <div className="campo-formulario">
              <label className="label-formulario">Subcategoría *</label>
              <select
                value={subcategoria}
                onChange={(e) => setSubcategoria(e.target.value)}
                className="input-formulario"
              >
                {SUBCATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div className="campo-formulario">
              <label className="label-formulario">Precio ($ ARS) *</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej. 1800"
                className="input-formulario"
                min="0"
                required
              />
            </div>

            {/* Emoji representativo */}
            <div className="campo-formulario">
              <label className="label-formulario">Ícono / Emoji</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="Ej. 🥐, 🧁, ☕, 🥪, 🍋"
                className="input-formulario"
                maxLength="4"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="campo-formulario">
            <label className="label-formulario">Descripción Breve</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Horneada en el día con pura manteca y almíbar clásico..."
              className="input-formulario"
              rows="2"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Imagen (Opcional) */}
          <div className="campo-formulario">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="label-formulario" style={{ marginBottom: 0 }}>Foto del Ítem (Opcional)</label>
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
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={filePreview}
                      alt="Vista previa"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--rosa-borde)' }}
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
                      style={{ color: '#b91c1c', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Quitar foto
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/foto-desayuno.jpg"
                className="input-formulario"
              />
            )}
          </div>

          {/* Checkbox Disponible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="disp-desayuno"
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--rosa-principal)' }}
            />
            <label htmlFor="disp-desayuno" style={{ fontSize: '0.9rem', color: 'var(--texto-oscuro)', cursor: 'pointer' }}>
              Ítem disponible para que los clientes lo elijan
            </label>
          </div>

          {/* Botones de acción */}
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
              {isSubmitting ? 'Guardando en MongoDB...' : (editingItem ? '💾 Guardar Cambios' : '➕ Agregar Ítem')}
            </button>
          </div>
        </form>
      </div>

      {/* FILTROS POR SUBCATEGORÍA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h4 style={{ color: 'var(--texto-oscuro)', fontSize: '1.1rem', margin: 0 }}>
          Ítems Cargados ({itemsFiltrados.length})
        </h4>

        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {['Todos', ...SUBCATEGORIAS].map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSubcatFiltro(sub)}
              style={{
                border: '1px solid',
                borderColor: subcatFiltro === sub ? 'var(--rosa-principal)' : 'var(--rosa-borde)',
                backgroundColor: subcatFiltro === sub ? 'var(--rosa-principal)' : 'var(--blanco-card)',
                color: subcatFiltro === sub ? '#ffffff' : 'var(--texto-oscuro)',
                padding: '0.3rem 0.75rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE ÍTEMS DE DESAYUNO */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-gris)' }}>
          Cargando opciones de desayuno desde MongoDB Atlas...
        </div>
      ) : itemsFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: 'var(--blanco-card)', borderRadius: '16px', border: '1px dashed var(--rosa-borde)' }}>
          <p style={{ color: 'var(--texto-gris)', fontSize: '0.95rem' }}>No hay ítems en esta categoría.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {itemsFiltrados.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: 'var(--blanco-card)',
                border: '1px solid var(--rosa-borde)',
                borderRadius: '14px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: item.disponible ? 1 : 0.6,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.emoji || '🧁'}</span>
                    <strong style={{ color: 'var(--texto-oscuro)', fontSize: '0.95rem' }}>{item.nombre}</strong>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'var(--rosa-suave)',
                      color: 'var(--rosa-principal)',
                      fontWeight: 600
                    }}
                  >
                    {item.subcategoria}
                  </span>
                </div>

                {item.descripcion && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', marginBottom: '0.6rem' }}>
                    {item.descripcion}
                  </p>
                )}

                {item.imagen && (
                  <div style={{ marginBottom: '0.6rem' }}>
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderTop: '1px solid var(--rosa-suave)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--rosa-principal)' }}>
                    {formatPrice(item.precio)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    style={{
                      border: 'none',
                      background: item.disponible ? '#dcfce7' : '#fee2e2',
                      color: item.disponible ? '#15803d' : '#b91c1c',
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {item.disponible ? '✓ Disponible' : '⏸ Pausado'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="boton-admin-link"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem', padding: '0.4rem', minHeight: '36px' }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id, item.nombre)}
                    className="boton-admin-logout"
                    style={{ padding: '0.4rem 0.75rem', minHeight: '36px' }}
                    title="Eliminar de la base de datos"
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
