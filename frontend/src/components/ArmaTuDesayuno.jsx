import { useState } from 'react';
import {
  ITEMS_CREADOR_DESAYUNO,
  CATEGORIAS_CREADOR_DESAYUNO
} from '../data/mockData';
import { formatPrice } from '../utils/formatters';

export default function ArmaTuDesayuno({ onAddToCart }) {
  // Cantidades de cada ítem: { [itemId]: number }
  const [quantities, setQuantities] = useState({});
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [dedicatoria, setDedicatoria] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

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
      const item = ITEMS_CREADOR_DESAYUNO.find((i) => i.id === id);
      return item ? { ...item, cantidad: qty } : null;
    })
    .filter(Boolean);

  const totalItemsCount = selectedItems.reduce((acc, i) => acc + i.cantidad, 0);
  const totalPrice = selectedItems.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  // Filtrado de ítems por categoría
  const displayedItems = ITEMS_CREADOR_DESAYUNO.filter(
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
            {CATEGORIAS_CREADOR_DESAYUNO.map((cat) => (
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
                {cat === 'Bebidas' && '☕ '}
                {cat === 'Dulces' && '🥐 '}
                {cat === 'Salados' && '🥪 '}
                {cat === 'Detalles' && '✨ '}
                {cat}
              </button>
            ))}
          </div>

          {/* GRILLA DE PRODUCTOS DISPONIBLES */}
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
                  {/* Encabezado de la tarjeta */}
                  <div>
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

                    <strong style={{ fontSize: '0.95rem', color: 'var(--texto-oscuro)', display: 'block', marginBottom: '4px' }}>
                      {item.nombre}
                    </strong>

                    {item.desc && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                        {item.desc}
                      </p>
                    )}
                  </div>

                  {/* Precio y Controles de Cantidad */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.75rem',
                      borderTop: '1px solid var(--rosa-borde)',
                      paddingTop: '0.65rem'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--texto-gris)', display: 'block' }}>Precio unitario:</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--rosa-principal)' }}>
                        {item.precio > 0 ? formatPrice(item.precio) : 'Gratis'}
                      </strong>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="btn-sumar-restar"
                        style={{
                          width: 'auto',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        + Agregar
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="btn-sumar-restar"
                          title="Restar una unidad"
                        >
                          -
                        </button>
                        <span style={{ fontWeight: '800', fontSize: '1rem', minWidth: '20px', textAlign: 'center' }}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="btn-sumar-restar"
                          title="Sumar una unidad"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA Y PRESUPUESTO EN TIEMPO REAL */}
        <div>
          <div className="tarjeta-resumen-fija">
            <div className="encabezado-resumen">
              <h3 className="titulo-resumen">Vista Previa del Desayuno</h3>
              <span className="badge-etiqueta">
                {totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>

            {/* Ilustración amigable */}
            <div
              className="caja-ilustracion-torta"
              style={{
                height: '110px',
                background: 'var(--rosa-fondo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>☕ 🥐 🍓</span>
              <small style={{ color: 'var(--texto-gris)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                Tu desayuno personalizado
              </small>
            </div>

            {/* Lista detallada de ítems elegidos */}
            <div style={{ margin: '1rem 0', maxHeight: '280px', overflowY: 'auto' }}>
              {selectedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--texto-gris)' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Tu desayuno está vacío.</p>
                  <small style={{ fontSize: '0.8rem' }}>
                    Tocá <strong>+ Agregar</strong> en medialunas, bebidas o lo que prefieras para armar tu pedido.
                  </small>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        padding: '4px 0',
                        borderBottom: '1px dashed var(--rosa-borde)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, paddingRight: '6px' }}>
                        <span>{item.emoji}</span>
                        <div>
                          <strong style={{ color: 'var(--texto-oscuro)' }}>{item.nombre}</strong>
                          <span style={{ color: 'var(--texto-gris)', fontSize: '0.75rem', marginLeft: '4px' }}>
                            (x{item.cantidad})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--rosa-principal)' }}>
                          {formatPrice(item.precio * item.cantidad)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="btn-eliminar-item"
                          title="Quitar del desayuno"
                          style={{ padding: '0 4px', fontSize: '0.85rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dedicatoria personalizada */}
            <div className="campo-grupo" style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                💌 Dedicatoria para la tarjeta (opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: ¡Feliz cumple mamá, te amamos!"
                value={dedicatoria}
                onChange={(e) => setDedicatoria(e.target.value)}
                className="campo-texto"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              />
            </div>

            {/* TOTAL DINÁMICO */}
            <div className="bloque-total-est" style={{ marginTop: '1rem', paddingTop: '0.75rem' }}>
              <div>
                <span className="label-total" style={{ display: 'block' }}>Total del Desayuno:</span>
                <small style={{ color: 'var(--texto-gris)', fontSize: '0.75rem' }}>
                  {totalItemsCount} {totalItemsCount === 1 ? 'producto incluido' : 'productos incluidos'}
                </small>
              </div>
              <span className="monto-total">{formatPrice(totalPrice)}</span>
            </div>

            {/* BOTÓN DE AGREGAR AL CARRITO */}
            <button
              onClick={handleAgregarAlPedido}
              disabled={selectedItems.length === 0}
              className="boton-confirmar"
              style={{
                width: '100%',
                marginTop: '1rem',
                opacity: selectedItems.length === 0 ? 0.6 : 1,
                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
              }}
              type="button"
            >
              🛒 Agregar Desayuno al Pedido ({formatPrice(totalPrice)})
            </button>

            {selectedItems.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="btn-eliminar-item"
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--texto-gris)',
                  textAlign: 'center',
                  background: 'none'
                }}
              >
                Limpiar selección
              </button>
            )}

            {addedSuccess && (
              <p
                style={{
                  textAlign: 'center',
                  color: '#15803d',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  marginTop: '0.75rem'
                }}
              >
                ✅ ¡Desayuno agregado al carrito con éxito!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
