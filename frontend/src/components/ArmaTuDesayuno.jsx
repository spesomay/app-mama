import { useState, useEffect } from 'react';
import { getBreakfastItems } from '../services/breakfastService';
import { ITEMS_CREADOR_DESAYUNO } from '../data/mockData';
import { formatPrice } from '../utils/formatters';

const CATEGORIAS_DESAYUNO = ['Todos', 'Dulces', 'Salados', 'Infusiones', 'Mini Tortas', 'Detalles'];

export default function ArmaTuDesayuno({ onAddToCart }) {
  // Cantidades de cada ítem: { [itemId]: number }
  const [quantities, setQuantities] = useState({});
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [dedicatoria, setDedicatoria] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar ítems disponibles desde MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    getBreakfastItems({ disponible: true })
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const normalizados = data.map((item) => ({
            id: item._id,
            nombre: item.nombre,
            categoria: item.subcategoria || 'Dulces',
            precio: item.precio,
            emoji: item.emoji || '🧁',
            desc: item.descripcion || '',
            imagen: item.imagen || ''
          }));
          setItems(normalizados);
        } else {
          // Fallback a los datos de respaldo si no hay datos
          setItems(ITEMS_CREADOR_DESAYUNO);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Cargando respaldo local para desayunos:', err.message);
        if (isMounted) {
          setItems(ITEMS_CREADOR_DESAYUNO);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Manejo de cantidades libre (+ y -)
  const updateQuantity = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const removeItem = (id) => {
    setQuantities((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearAll = () => {
    setQuantities({});
    setDedicatoria('');
  };

  // Ítems actualmente seleccionados con cantidad > 0
  const selectedItems = Object.entries(quantities)
    .map(([id, qty]) => {
      const item = items.find((i) => i.id === id);
      return item ? { ...item, cantidad: qty } : null;
    })
    .filter(Boolean);

  const totalItemsCount = selectedItems.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrice = selectedItems.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  // Filtrado de ítems por categoría
  const displayedItems = items.filter(
    (item) => categoriaActiva === 'Todos' || item.categoria === categoriaActiva
  );

  // Agregar el combo armado al carrito de compras
  const handleAgregarAlPedido = () => {
    if (selectedItems.length === 0) {
      alert('Por favor sumá al menos un producto a tu desayuno antes de agregarlo al pedido.');
      return;
    }

    // Nombre del combo armado
    const nombreCombo = `Desayuno a Medida (${totalItemsCount} ${totalItemsCount === 1 ? 'producto' : 'productos'})`;

    // Armar el detalle formateado
    const desgloseTexto = selectedItems
      .map((i) => `${i.cantidad}x ${i.nombre}`)
      .join(', ');

    const detalleFinal = dedicatoria.trim()
      ? `${desgloseTexto} | 💌 Mensaje: "${dedicatoria.trim()}"`
      : desgloseTexto;

    onAddToCart({
      nombre: nombreCombo,
      precio: totalPrice,
      detalle: detalleFinal
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 3500);
  };

  return (
    <div>
      {/* BANNER DE BIENVENIDA */}
      <div
        className="banner-bienvenida"
        style={{
          background: 'linear-gradient(135deg, var(--blanco-card) 0%, var(--rosa-fondo) 100%)',
          marginBottom: '1.5rem'
        }}
      >
        <h2>☕ Armá tu Desayuno a Medida</h2>
        <p>
          Elegí libremente qué querés incluir y cuántas unidades de cada producto. Armá tu desayuno dulce, salado o mixto según tu gusto y presupuesto.
        </p>
      </div>

      <div className="diseno-grid-torta">
        {/* COLUMNA IZQUIERDA: SELECTOR LIBRE DE PRODUCTOS */}
        <div className="columna-pasos">
          {/* PESTAÑAS DE CATEGORÍAS */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              flexWrap: 'wrap',
              marginBottom: '1.25rem',
              alignItems: 'center'
            }}
          >
            {CATEGORIAS_DESAYUNO.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaActiva(cat)}
                className={`pestana ${categoriaActiva === cat ? 'activa' : ''}`}
                style={{
                  border: '1px solid var(--rosa-borde)',
                  borderRadius: '20px',
                  padding: '0.4rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  background: categoriaActiva === cat ? 'var(--rosa-principal)' : 'var(--blanco-card)',
                  color: categoriaActiva === cat ? 'white' : 'var(--texto-oscuro)',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'Infusiones' && '☕ '}
                {cat === 'Dulces' && '🥐 '}
                {cat === 'Salados' && '🥪 '}
                {cat === 'Mini Tortas' && '🧁 '}
                {cat === 'Detalles' && '✨ '}
                {cat}
              </button>
            ))}
          </div>

          {/* GRILLA DE PRODUCTOS DISPONIBLES */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--texto-gris)' }}>
              Cargando opciones deliciosas de desayuno...
            </div>
          ) : displayedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--blanco-card)', borderRadius: '16px', border: '1px dashed var(--rosa-borde)' }}>
              <p style={{ color: 'var(--texto-gris)' }}>No hay productos en esta categoría por el momento.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem'
              }}
            >
              {displayedItems.map((item) => {
                const qty = quantities[item.id] || 0;
                const isSelected = qty > 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--blanco-card)',
                      border: isSelected ? '2px solid var(--rosa-principal)' : '1px solid var(--rosa-borde)',
                      backgroundColor: isSelected ? 'var(--rosa-suave)' : 'var(--blanco-card)',
                      borderRadius: '16px',
                      padding: '1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--sombra-card)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {item.imagen ? (
                        <div style={{ position: 'relative', width: '100%', height: '110px', marginBottom: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              fontSize: '0.65rem',
                              background: isSelected ? 'var(--rosa-principal)' : 'rgba(255, 255, 255, 0.9)',
                              color: isSelected ? 'white' : 'var(--texto-oscuro)',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontWeight: 'bold'
                            }}
                          >
                            {item.categoria}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{item.emoji}</span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              background: isSelected ? 'var(--rosa-principal)' : 'var(--rosa-fondo)',
                              color: isSelected ? 'white' : 'var(--texto-gris)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontWeight: 'bold'
                            }}
                          >
                            {item.categoria}
                          </span>
                        </div>
                      )}

                      <strong style={{ fontSize: '0.95rem', color: 'var(--texto-oscuro)', display: 'block', marginBottom: '4px' }}>
                        {item.nombre}
                      </strong>

                      {item.desc && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                          {item.desc}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--rosa-principal)' }}>
                        {formatPrice(item.precio)}
                      </span>

                      {/* Controles de Cantidad (+ / -) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {qty > 0 && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="btn-sumar-restar"
                              title="Restar una unidad"
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--texto-oscuro)' }}>
                              {qty}
                            </span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="btn-sumar-restar"
                          title="Sumar una unidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: RESUMEN Y PRESUPUESTO EN TIEMPO REAL */}
        <div className="columna-resumen">
          <div
            className="resumen-card-torta"
            style={{
              position: 'sticky',
              top: '90px',
              background: 'var(--blanco-card)',
              border: '1.5px solid var(--rosa-borde)',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: 'var(--sombra-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--texto-oscuro)', fontFamily: 'Georgia, serif' }}>
                Tu Desayuno
              </h3>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b91c1c',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Listado de ítems seleccionados */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '4px' }}>
              {selectedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.75rem 0.5rem', color: 'var(--texto-gris)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🧺</div>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    Todavía no sumaste ningún producto.
                  </p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--texto-gris)' }}>
                    Pulsá el botón <strong>+</strong> en lo que quieras agregar.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--rosa-fondo)',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span>{item.emoji}</span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: 'var(--texto-oscuro)' }}>{item.nombre}</strong>
                          <span style={{ color: 'var(--texto-gris)', marginLeft: '4px' }}>x{item.cantidad}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--rosa-principal)' }}>
                          {formatPrice(item.precio * item.cantidad)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--texto-gris)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '2px 4px'
                          }}
                          title="Quitar"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campo opcional de dedicatoria */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--texto-oscuro)', display: 'block', marginBottom: '4px' }}>
                💌 Mensaje o dedicatoria (Opcional):
              </label>
              <textarea
                value={dedicatoria}
                onChange={(e) => setDedicatoria(e.target.value)}
                placeholder="Ej. ¡Muy feliz cumple mamá! Te queremos mucho..."
                className="input-formulario"
                rows="2"
                style={{ fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>

            {/* Presupuesto Total */}
            <div
              style={{
                borderTop: '2px dashed var(--rosa-borde)',
                paddingTop: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--texto-gris)', display: 'block' }}>
                  Total ({totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}):
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--rosa-principal)' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Botón de Agregar al Carrito */}
            <button
              type="button"
              onClick={handleAgregarAlPedido}
              disabled={selectedItems.length === 0}
              className="boton-confirmar"
              style={{
                width: '100%',
                opacity: selectedItems.length === 0 ? 0.5 : 1,
                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                padding: '0.85rem 1rem',
                fontSize: '0.95rem'
              }}
            >
              {addedSuccess ? '¡Agregado al Carrito! ✓' : '🛒 Agregar Desayuno al Pedido'}
            </button>
          </div>
        </div>
      </div>

      {/* BARRA FLOTANTE MOBILE PARA COMPLETAR COMPRA */}
      {selectedItems.length > 0 && (
        <div className="barra-flotante-mobile-desayuno">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--texto-gris)', display: 'block' }}>
              Desayuno ({totalItemsCount} {totalItemsCount === 1 ? 'prod.' : 'prods.'})
            </span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--rosa-principal)' }}>
              {formatPrice(totalPrice)}
            </strong>
          </div>
          <button
            type="button"
            onClick={handleAgregarAlPedido}
            className="boton-confirmar"
            style={{ width: 'auto', padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            {addedSuccess ? '¡Agregado! ✓' : 'Agregar 🛒'}
          </button>
        </div>
      )}
    </div>
  );
}
