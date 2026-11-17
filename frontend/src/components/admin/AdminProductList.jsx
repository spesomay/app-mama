import { useState } from 'react';
import { formatPrice, formatDate } from '../../utils/formatters';
import { getProductImageUrl } from '../../services/productService';

export default function AdminProductList({
  products,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onRefresh
}) {
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrado local en tiempo real
  const filteredProducts = products.filter((p) => {
    const coincideCat = categoriaFiltro === 'Todos' || p.categoria === categoriaFiltro;
    const searchLow = busqueda.toLowerCase().trim();
    const coincideSearch =
      !searchLow ||
      p.nombre.toLowerCase().includes(searchLow) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchLow));
    return coincideCat && coincideSearch;
  });

  return (
    <div className="tarjeta-paso" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="subtitulo-form" style={{ margin: 0 }}>
            📦 Lista de Productos Cargados ({filteredProducts.length} de {products.length})
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', margin: '2px 0 0 0' }}>
            Gestioná tus publicaciones en tiempo real en MongoDB Atlas.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="btn-sumar-restar"
          style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          type="button"
          title="Recargar desde la base de datos"
        >
          🔄 Actualizar lista
        </button>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Buscador de texto */}
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="campo-texto"
          style={{ padding: '0.6rem 1rem' }}
        />

        {/* Pestañas de categorías */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['Todos', 'Tortas', 'Tartas', 'Desayunos', 'Varios'].map((cat) => (
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
      </div>

      {/* ESTADO DE CARGA O LISTA */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '30px 0', color: 'var(--texto-gris)' }}>
          Cargando catálogo desde MongoDB Atlas...
        </p>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--texto-gris)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>🔍 No se encontraron productos.</p>
          <small>Probá con otro término de búsqueda o categoría, o cargá uno nuevo arriba.</small>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredProducts.map((p) => {
            const imageUrl = getProductImageUrl(p.imagen);

            return (
              <div
                key={p._id}
                style={{
                  background: 'var(--blanco-card)',
                  border: '1px solid var(--rosa-borde)',
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto',
                  gap: '1rem',
                  alignItems: 'center',
                  boxShadow: 'var(--sombra-card)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Miniatura de imagen */}
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'var(--rosa-fondo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--rosa-borde)'
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerText = '🍰';
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '2.5rem' }}>
                      {p.categoria === 'Tartas' ? '🥧' : p.categoria === 'Desayunos' ? '☕' : '🍰'}
                    </span>
                  )}
                </div>

                {/* Datos del producto */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--texto-oscuro)' }}>{p.nombre}</strong>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: 'var(--rosa-suave)',
                        color: 'var(--rosa-principal)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {p.categoria}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: p.disponible ? '#dcfce7' : '#fee2e2',
                        color: p.disponible ? '#15803d' : '#b91c1c',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {p.disponible ? '✓ Disponible' : '⏸️ Pausado'}
                    </span>
                  </div>

                  {p.descripcion && (
                    <p style={{ margin: '3px 0 6px 0', fontSize: '0.85rem', color: 'var(--texto-gris)' }}>
                      {p.descripcion}
                    </p>
                  )}

                  {/* Opciones configuradas */}
                  {Array.isArray(p.opciones) && p.opciones.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '6px' }}>
                      {p.opciones.map((opt) => (
                        <span
                          key={opt}
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.75rem',
                            padding: '2px 7px',
                            borderRadius: '8px'
                          }}
                        >
                          • {opt}
                        </span>
                      ))}
                    </div>
                  )}

                  <small style={{ color: 'var(--texto-gris)', fontSize: '0.75rem' }}>
                    Actualizado: {formatDate(p.updatedAt || p.createdAt)}
                  </small>
                </div>

                {/* Precio y Botones de acción */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--rosa-principal)' }}>
                    {formatPrice(p.precio)}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(p)}
                      style={{
                        background: p.disponible ? '#fef3c7' : '#dcfce7',
                        color: p.disponible ? '#b45309' : '#15803d',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      title={p.disponible ? 'Pausar este producto' : 'Activar este producto'}
                    >
                      {p.disponible ? '⏸️ Pausar' : '▶️ Activar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      style={{
                        background: '#e0f2fe',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      title="Editar información, fotos y precios"
                    >
                      ✏️ Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(p._id, p.nombre)}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      title="Eliminar de la base de datos"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
