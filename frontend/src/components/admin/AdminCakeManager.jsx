import { useState, useEffect, useCallback } from 'react';
import {
  getCakeOptions,
  createCakeOption,
  updateCakeOption,
  deleteCakeOption
} from '../../services/cakeService';
import { formatPrice } from '../../utils/formatters';

const TIPOS_CONFIG = [
  { id: 'tamano', label: '📏 Tamaños y Porciones' },
  { id: 'estilo', label: '🎨 Estilos de Cobertura' },
  { id: 'bizcochuelo', label: '🍞 Bizcochuelos' },
  { id: 'relleno', label: '🍓 Rellenos' }
];

export default function AdminCakeManager() {
  const [activeTipo, setActiveTipo] = useState('tamano');
  const [allOptions, setAllOptions] = useState({
    tamanos: [],
    estilos: [],
    bizcochuelos: [],
    rellenos: [],
    todas: []
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [maxRellenos, setMaxRellenos] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [disponible, setDisponible] = useState(true);

  // Feedback
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback({ type: '', text: '' });
    }, 4500);
  };

  const loadOptions = useCallback(() => {
    getCakeOptions()
      .then((data) => {
        setAllOptions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar opciones de tortas:', err);
        setLoading(false);
        showFeedback('error', 'No se pudieron cargar las opciones desde MongoDB.');
      });
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const resetForm = () => {
    setEditingOption(null);
    setNombre('');
    setPrecio('');
    setMaxRellenos(activeTipo === 'tamano' ? 1 : 1);
    setDescripcion('');
    setDisponible(true);
  };

  const handleStartEdit = (option) => {
    setEditingOption(option);
    setActiveTipo(option.tipo);
    setNombre(option.nombre);
    setPrecio(option.precio);
    setMaxRellenos(option.maxRellenos || 1);
    setDescripcion(option.descripcion || '');
    setDisponible(option.disponible !== false);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      showFeedback('error', 'El nombre es obligatorio.');
      return;
    }

    if (precio === '' || isNaN(Number(precio)) || Number(precio) < 0) {
      showFeedback('error', 'Ingresá un precio válido mayor o igual a cero.');
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      const payload = {
        tipo: activeTipo,
        nombre: nombre.trim(),
        precio: Number(precio),
        descripcion: descripcion.trim(),
        disponible
      };

      if (activeTipo === 'tamano') {
        payload.maxRellenos = Math.max(1, Number(maxRellenos));
      }

      if (editingOption) {
        await updateCakeOption(editingOption._id, payload);
        showFeedback('success', `¡Opción "${nombre}" actualizada con éxito en MongoDB!`);
      } else {
        await createCakeOption(payload);
        showFeedback('success', `¡Opción "${nombre}" creada con éxito!`);
      }

      resetForm();
      loadOptions();
    } catch (err) {
      console.error('Error al guardar opción de torta:', err);
      showFeedback('error', err.response?.data?.error || err.message || 'Error al guardar la opción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, optNombre) => {
    const confirm = window.confirm(`¿Estás segura de eliminar permanentemente "${optNombre}"?`);
    if (!confirm) return;

    try {
      await deleteCakeOption(id);
      showFeedback('success', `Opción "${optNombre}" eliminada correctamente.`);
      if (editingOption && editingOption._id === id) {
        resetForm();
      }
      loadOptions();
    } catch (err) {
      console.error('Error al eliminar:', err);
      showFeedback('error', err.response?.data?.error || 'No se pudo eliminar la opción.');
    }
  };

  const handleToggleStatus = async (option) => {
    try {
      await updateCakeOption(option._id, { disponible: !option.disponible });
      loadOptions();
      showFeedback('success', `"${option.nombre}" ahora está ${!option.disponible ? 'disponible' : 'pausado'}.`);
    } catch (err) {
      console.error('Error al cambiar disponibilidad:', err);
      showFeedback('error', 'No se pudo cambiar el estado.');
    }
  };

  // Obtener la lista actual según la subpestaña seleccionada
  const currentList = activeTipo === 'tamano'
    ? allOptions.tamanos || []
    : activeTipo === 'estilo'
    ? allOptions.estilos || []
    : activeTipo === 'bizcochuelo'
    ? allOptions.bizcochuelos || []
    : allOptions.rellenos || [];

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

      {/* SUB-PESTAÑAS DEL CONSTRUCTOR */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '4px' }}>
        {TIPOS_CONFIG.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveTipo(t.id);
              if (editingOption && editingOption.tipo !== t.id) {
                resetForm();
              }
            }}
            className={`pestana ${activeTipo === t.id ? 'activa' : ''}`}
            style={{ fontSize: '0.9rem', padding: '0.55rem 1.1rem', whiteSpace: 'nowrap' }}
          >
            {t.label}
          </button>
        ))}
      </div>

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
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', color: 'var(--texto-oscuro)', fontSize: '1.25rem' }}>
              {editingOption
                ? `✏️ Editando: ${editingOption.nombre}`
                : `➕ Agregar opción en ${TIPOS_CONFIG.find((t) => t.id === activeTipo)?.label}`}
            </h3>
            <p style={{ color: 'var(--texto-gris)', fontSize: '0.85rem', marginTop: '2px' }}>
              {activeTipo === 'tamano'
                ? 'El precio corresponde al valor base y define cuántos rellenos permite este tamaño.'
                : 'El precio corresponde al adicional sumado al valor base.'}
            </p>
          </div>
          {editingOption && (
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
              <label className="label-formulario">
                {activeTipo === 'tamano' ? 'Nombre del Tamaño / Porciones *' : 'Nombre de la Opción *'}
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={
                  activeTipo === 'tamano'
                    ? 'Ej. Mediana (15 - 20 porciones)'
                    : activeTipo === 'estilo'
                    ? 'Ej. Buttercream Liso o Drip Cake'
                    : activeTipo === 'bizcochuelo'
                    ? 'Ej. Chocolate Intenso'
                    : 'Ej. Dulce de Leche con Merenguitos'
                }
                className="input-formulario"
                required
              />
            </div>

            {/* Precio Base o Adicional */}
            <div className="campo-formulario">
              <label className="label-formulario">
                {activeTipo === 'tamano' ? 'Precio Base ($ ARS) *' : 'Precio Adicional ($ ARS) *'}
              </label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder={activeTipo === 'tamano' ? 'Ej. 20000' : 'Ej. 1500 (o 0 si no tiene extra)'}
                className="input-formulario"
                min="0"
                required
              />
            </div>

            {/* Máximo de Rellenos (solo para Tamaños) */}
            {activeTipo === 'tamano' && (
              <div className="campo-formulario">
                <label className="label-formulario">
                  Máximo de Rellenos Permitidos *
                </label>
                <select
                  value={maxRellenos}
                  onChange={(e) => setMaxRellenos(Number(e.target.value))}
                  className="input-formulario"
                  style={{ fontWeight: 600 }}
                >
                  <option value={1}>1 Relleno máximo</option>
                  <option value={2}>2 Rellenos máximos</option>
                  <option value={3}>3 Rellenos máximos</option>
                  <option value={4}>4 Rellenos máximos</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--texto-gris)', marginTop: '4px' }}>
                  El cliente solo podrá marcar hasta esta cantidad al elegir este tamaño.
                </span>
              </div>
            )}
          </div>

          {/* Descripción opcional */}
          <div className="campo-formulario">
            <label className="label-formulario">Descripción Breve (Opcional)</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles adicionales, recomendaciones o notas..."
              className="input-formulario"
            />
          </div>

          {/* Checkbox Disponible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="disp-cake-opt"
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--rosa-principal)' }}
            />
            <label htmlFor="disp-cake-opt" style={{ fontSize: '0.9rem', color: 'var(--texto-oscuro)', cursor: 'pointer' }}>
              Opción disponible en el constructor de tortas
            </label>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            {editingOption && (
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
              {isSubmitting ? 'Guardando en MongoDB...' : (editingOption ? '💾 Guardar Cambios' : '➕ Guardar Opción')}
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO DE OPCIONES CARGADAS */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--texto-oscuro)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
          Opciones Cargadas en {TIPOS_CONFIG.find((t) => t.id === activeTipo)?.label} ({currentList.length})
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-gris)' }}>
            Cargando opciones desde MongoDB Atlas...
          </div>
        ) : currentList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: 'var(--blanco-card)', borderRadius: '16px', border: '1px dashed var(--rosa-borde)' }}>
            <p style={{ color: 'var(--texto-gris)', fontSize: '0.95rem' }}>No hay opciones cargadas en esta sección.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {currentList.map((item) => (
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <strong style={{ color: 'var(--texto-oscuro)', fontSize: '1rem' }}>
                      {item.nombre}
                    </strong>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      style={{
                        border: 'none',
                        background: item.disponible ? '#dcfce7' : '#fee2e2',
                        color: item.disponible ? '#15803d' : '#b91c1c',
                        fontSize: '0.7rem',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {item.disponible ? '✓ Activo' : '⏸ Pausado'}
                    </button>
                  </div>

                  {item.descripcion && (
                    <p style={{ color: 'var(--texto-gris)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      {item.descripcion}
                    </p>
                  )}

                  {item.tipo === 'tamano' && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'var(--rosa-suave)',
                          color: 'var(--rosa-principal)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontWeight: 700
                        }}
                      >
                        ⚡ Admite hasta {item.maxRellenos || 1} {item.maxRellenos === 1 ? 'relleno' : 'rellenos'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--rosa-suave)', paddingTop: '0.6rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--texto-gris)' }}>
                      {item.tipo === 'tamano' ? 'Precio Base:' : 'Precio Adicional:'}
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--rosa-principal)' }}>
                      {item.precio === 0 ? 'Sin cargo ($0)' : formatPrice(item.precio)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                      onClick={() => handleDelete(item._id, item.nombre)}
                      className="boton-admin-logout"
                      style={{ padding: '0.4rem 0.75rem', minHeight: '34px' }}
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
    </div>
  );
}
