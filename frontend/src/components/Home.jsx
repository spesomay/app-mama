import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../App.css';
import {
  ESTILOS_TORTA,
  TAMANOS_TORTA,
  BIZCOCHUELOS_TORTA,
  RELLENOS_TORTA,
  SABORES_TARTAS,
  TAMANOS_TARTAS,
  CREMAS_TARTAS,
  ITEMS_DESAYUNO,
  GALERIA_TRABAJOS
} from '../data/mockData.js';
import { formatPrice } from '../utils/formatters.js';
import { getProductImageUrl } from '../services/productService.js';
import { getGalleryItems } from '../services/galleryService.js';
import { getCakeOptions } from '../services/cakeService.js';
import { playCartSound } from '../utils/sound.js';
import ArmaTuDesayuno from './ArmaTuDesayuno.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WHATSAPP_NUMERO = import.meta.env.VITE_WHATSAPP_PHONE || '5491155856994';

export default function Home({ activeTab, setActiveTab, cart, setCart, triggerCartAnimation }) {
  const [subCatDesayuno, setSubCatDesayuno] = useState('Todos');
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [dbGallery, setDbGallery] = useState([]);

  // Notificación flotante de confirmación (Toast)
  const [cartToast, setCartToast] = useState({ visible: false, item: null });
  // ID del ítem recién agregado para animar su botón
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);
  const toastTimerRef = useRef(null);

  // Formulario de entrega
  const [datosEntrega, setDatosEntrega] = useState({
    nombre: '',
    fecha: '',
    modalidad: 'Retiro por taller',
    notas: ''
  });

  // Filtro de la Galería pública
  const [categoriaGaleria, setCategoriaGaleria] = useState('Todos');

  // Opciones dinámicas para el configurador de Tortas a Medida (cargadas desde MongoDB)
  const [cakeOptions, setCakeOptions] = useState({
    tamanos: TAMANOS_TORTA.map((t, idx) => ({ _id: `tam_${idx}`, nombre: t.nombre, precio: t.extra || 14000, maxRellenos: idx === 0 ? 1 : 2 })),
    estilos: ESTILOS_TORTA.map((e, idx) => ({ _id: `est_${idx}`, nombre: e.nombre, precio: e.precio, descripcion: e.desc })),
    bizcochuelos: BIZCOCHUELOS_TORTA.map((b, idx) => ({ _id: `biz_${idx}`, nombre: b.nombre, precio: b.extra })),
    rellenos: RELLENOS_TORTA.map((r, idx) => ({ _id: `rel_${idx}`, nombre: r.nombre, precio: r.extra }))
  });

  // Estado del configurador de Tortas a Medida
  const [customCake, setCustomCake] = useState({
    estilo: { nombre: 'Drip Cake', precio: 3000 },
    tamano: { nombre: 'Chica (8 - 10 porciones)', precio: 14000, maxRellenos: 1 },
    bizcochuelo: { nombre: 'Vainilla Tradicional Húmedo', precio: 0 },
    rellenos: [{ nombre: 'Dulce de Leche Clásico Artesanal', precio: 0 }],
    mensaje: ''
  });

  // Estado del configurador de Tartas Clásicas
  const [customTarta, setCustomTarta] = useState({
    sabor: SABORES_TARTAS[0],
    tamano: TAMANOS_TARTAS[0],
    crema: CREMAS_TARTAS[0]
  });

  // Carga de productos, galería y opciones de tortas desde el backend
  useEffect(() => {
    let isMounted = true;
    axios.get(`${API_BASE}/products`)
      .then((res) => {
        if (isMounted) {
          setDbProducts(res.data);
          setLoadingProducts(false);
        }
      })
      .catch((err) => {
        console.warn('Backend no disponible, usando catálogo local de respaldo:', err.message);
        if (isMounted) {
          setLoadingProducts(false);
        }
      });

    getGalleryItems()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setDbGallery(data);
        }
      })
      .catch((err) => {
        console.warn('No se pudo conectar a la galería de MongoDB:', err.message);
      });

    getCakeOptions()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.tamanos && data.tamanos.length > 0) {
          const optActivas = {
            tamanos: data.tamanos.filter((t) => t.disponible),
            estilos: data.estilos.filter((e) => e.disponible),
            bizcochuelos: data.bizcochuelos.filter((b) => b.disponible),
            rellenos: data.rellenos.filter((r) => r.disponible)
          };
          setCakeOptions(optActivas);

          setCustomCake((prev) => {
            const primerTam = optActivas.tamanos[0] || prev.tamano;
            const primerEst = optActivas.estilos[0] || prev.estilo;
            const primerBiz = optActivas.bizcochuelos[0] || prev.bizcochuelo;
            const maxRel = primerTam?.maxRellenos || 1;
            const primerRel = optActivas.rellenos.slice(0, maxRel);

            return {
              ...prev,
              tamano: primerTam,
              estilo: primerEst,
              bizcochuelo: primerBiz,
              rellenos: primerRel.length > 0 ? primerRel : prev.rellenos
            };
          });
        }
      })
      .catch((err) => {
        console.warn('Usando opciones locales de respaldo para tortas:', err.message);
      });

    return () => {
      isMounted = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Funciones del Carrito con Feedback Sonoro y Visual
  const addToCart = (item, itemId = null) => {
    // 1. Sonido suave y alegre (Web Audio API) + vibración háptica móvil
    playCartSound();

    // 2. Animación de rebote visual en el botón de carrito del encabezado
    if (triggerCartAnimation) {
      triggerCartAnimation();
    }

    // 3. Feedback visual momentáneo en el botón pulsado
    if (itemId) {
      setRecentlyAddedId(itemId);
      setTimeout(() => {
        setRecentlyAddedId((curr) => (curr === itemId ? null : curr));
      }, 1200);
    }

    // 4. Mostrar notificación flotante (Toast)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setCartToast({ visible: true, item });
    toastTimerRef.current = setTimeout(() => {
      setCartToast({ visible: false, item: null });
    }, 3200);

    // 5. Agregar producto al estado del carrito
    setCart((prevCart) => {
      const existsIndex = prevCart.findIndex(
        (p) => p.nombre === item.nombre && p.detalle === item.detalle
      );
      if (existsIndex > -1) {
        return prevCart.map((p, idx) =>
          idx === existsIndex ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prevCart, { ...item, cantidad: 1 }];
    });
  };

  const updateQuantity = (nombre, detalle, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.nombre === nombre && item.detalle === detalle) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (nombre, detalle) => {
    setCart((prev) => prev.filter((item) => !(item.nombre === nombre && item.detalle === detalle)));
  };

  const totalCart = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Cálculos dinámicos de precios
  const precioTortaActual =
    (customCake.tamano?.precio || 0) +
    (customCake.estilo?.precio || 0) +
    (customCake.bizcochuelo?.precio || 0) +
    customCake.rellenos.reduce((acc, r) => acc + (r.precio || 0), 0);

  const precioTartaActual =
    customTarta.sabor.precio + (customTarta.tamano.extra || 0);

  // Regla dinámica de rellenos según el tamaño elegido
  const maxRellenosPermitidos = customCake.tamano?.maxRellenos || 1;

  const handleSelectTamano = (nuevoTamano) => {
    setCustomCake((prev) => {
      const maxPermitido = nuevoTamano.maxRellenos || 1;
      const rellenosAjustados = prev.rellenos.slice(0, maxPermitido);
      return {
        ...prev,
        tamano: nuevoTamano,
        rellenos: rellenosAjustados
      };
    });
  };

  const toggleRelleno = (relleno) => {
    setCustomCake((prev) => {
      const existe = prev.rellenos.some(
        (r) => (r._id && r._id === relleno._id) || r.nombre === relleno.nombre
      );
      if (existe) {
        return {
          ...prev,
          rellenos: prev.rellenos.filter(
            (r) => (r._id && r._id !== relleno._id) || r.nombre !== relleno.nombre
          )
        };
      }
      const max = prev.tamano?.maxRellenos || 1;
      if (max === 1) {
        // Si el tamaño solo admite 1, reemplazamos directamente
        return { ...prev, rellenos: [relleno] };
      }
      if (prev.rellenos.length < max) {
        return { ...prev, rellenos: [...prev.rellenos, relleno] };
      }
      return prev;
    });
  };

  // Generación y envío del pedido por WhatsApp
  const sendWhatsApp = () => {
    if (cart.length === 0) return alert('El carrito está vacío. Agregá algún producto antes de enviar.');
    if (!datosEntrega.nombre.trim()) return alert('Por favor, ingresá tu Nombre y Apellido.');
    if (!datosEntrega.fecha) return alert('Por favor, seleccioná una Fecha de Entrega.');

    let mensaje = `¡Hola Hecho by Gaby! 🍰 Quisiera confirmar el siguiente pedido:\n\n`;
    mensaje += `👤 *Cliente:* ${datosEntrega.nombre.trim()}\n`;
    mensaje += `📅 *Fecha de Entrega:* ${datosEntrega.fecha}\n`;
    mensaje += `🚚 *Modalidad:* ${datosEntrega.modalidad}\n`;
    if (datosEntrega.notas.trim()) mensaje += `📝 *Notas:* ${datosEntrega.notas.trim()}\n`;

    mensaje += `\n*Detalle del Pedido:*\n`;
    cart.forEach((item) => {
      mensaje += `• *${item.nombre}* (x${item.cantidad}) - ${formatPrice(item.precio * item.cantidad)}\n`;
      if (item.detalle) mensaje += `  _${item.detalle}_\n`;
    });

    mensaje += `\n*Total a pagar: ${formatPrice(totalCart)}*`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  const agregarTortaPersonalizada = () => {
    const detalleRellenos = customCake.rellenos.map((r) => r.nombre).join(', ') || 'Sin rellenos';
    let detalle = `Tamaño: ${customCake.tamano.nombre} | Bizcochuelo: ${customCake.bizcochuelo.nombre} | Rellenos: ${detalleRellenos}`;
    if (customCake.mensaje.trim()) detalle += ` | Mensaje: "${customCake.mensaje.trim()}"`;

    addToCart({
      nombre: `Torta A Medida (${customCake.estilo.nombre})`,
      precio: precioTortaActual,
      detalle
    });
  };

  const agregarTartaPersonalizada = () => {
    const detalle = customTarta.sabor.requiereCrema
      ? `Tamaño: ${customTarta.tamano.nombre} | Crema: ${customTarta.crema}`
      : `Tamaño: ${customTarta.tamano.nombre} | Receta Clásica`;

    addToCart({
      nombre: customTarta.sabor.nombre,
      precio: precioTartaActual,
      detalle
    });
  };

  // Combinación de productos: si hay en MongoDB los usamos; si no, los mock
  const productosStock = dbProducts.length > 0
    ? dbProducts.filter((p) => p.disponible)
    : ITEMS_DESAYUNO;

  const hoyFechaMinima = new Date().toISOString().split('T')[0];

  return (
    <div>
      <nav className="barra-navegacion">
        <div className="contenedor pestañas-navegacion">
          <button onClick={() => setActiveTab('custom')} className={`pestana ${activeTab === 'custom' ? 'activa' : ''}`} type="button">
            🎂 Tortas A Medida
          </button>
          <button onClick={() => setActiveTab('classics')} className={`pestana ${activeTab === 'classics' ? 'activa' : ''}`} type="button">
            🥧 Tartas & Clásicos
          </button>
          <button onClick={() => setActiveTab('breakfast')} className={`pestana ${activeTab === 'breakfast' ? 'activa' : ''}`} type="button">
            ☕ Armá tu Desayuno / Stock
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`pestana ${activeTab === 'gallery' ? 'activa' : ''}`} type="button">
            🖼️ Galería
          </button>
          <button onClick={() => setActiveTab('faq')} className={`pestana ${activeTab === 'faq' ? 'activa' : ''}`} type="button">
            ❓ Preguntas Frecuentes
          </button>
          <button onClick={() => setActiveTab('resumen')} className={`pestana ${activeTab === 'resumen' ? 'activa' : ''}`} type="button">
            📋 Ver Resumen
          </button>
        </div>
      </nav>

      <div className="contenedor">
        {activeTab === 'resumen' ? (
          <div>
            <div className="banner-bienvenida">
              <h2>Resumen de tu Pedido 📋</h2>
              <p>Revisá el detalle de tu compra antes de enviar el mensaje directamente a la pastelería.</p>
            </div>

            <div className="grilla-resumen-carrito">
              <div className="tarjeta-paso">
                <h3 className="subtitulo-form">Detalle de la compra 🛒</h3>

                {cart.length === 0 ? (
                  <p className="label-det" style={{ padding: '30px 0', textAlign: 'center' }}>
                    Tu carrito está vacío. ¡Elegí o personalizá tu producto favorito!
                  </p>
                ) : (
                  <div>
                    {cart.map((item, index) => (
                      <div key={`${item.nombre}-${item.detalle || ''}-${index}`} className="item-carrito-fila">
                        <div className="item-carrito-titulo-row">
                          <span>{item.nombre} (x{item.cantidad})</span>
                          <button
                            onClick={() => removeFromCart(item.nombre, item.detalle)}
                            className="btn-eliminar-item"
                            title="Quitar item"
                            type="button"
                          >
                            ✕
                          </button>
                        </div>
                        {item.detalle && <p className="item-carrito-detalle">{item.detalle}</p>}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              onClick={() => updateQuantity(item.nombre, item.detalle, -1)}
                              className="btn-sumar-restar"
                              type="button"
                            >
                              -
                            </button>
                            <span style={{ fontWeight: 'bold' }}>{item.cantidad}</span>
                            <button
                              onClick={() => updateQuantity(item.nombre, item.detalle, 1)}
                              className="btn-sumar-restar"
                              type="button"
                            >
                              +
                            </button>
                          </div>
                          <span style={{ fontWeight: 'bold', color: 'var(--rosa-principal)' }}>
                            {formatPrice(item.precio * item.cantidad)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bloque-total-est" style={{ marginTop: '1.25rem' }}>
                  <span className="label-total">Total del Pedido:</span>
                  <span className="monto-total">{formatPrice(totalCart)}</span>
                </div>
              </div>

              <div className="tarjeta-paso">
                <h3 className="subtitulo-form">Datos de entrega 🚚</h3>

                <form className="formulario-datos-cliente" onSubmit={(e) => e.preventDefault()}>
                  <div className="campo-grupo">
                    <label>Nombre y Apellido *</label>
                    <input
                      type="text"
                      placeholder="Ej: María González"
                      value={datosEntrega.nombre}
                      onChange={(e) => setDatosEntrega({ ...datosEntrega, nombre: e.target.value })}
                      className="campo-texto"
                      required
                    />
                  </div>

                  <div className="columnas-2">
                    <div className="campo-grupo">
                      <label>Fecha de Entrega *</label>
                      <input
                        type="date"
                        min={hoyFechaMinima}
                        value={datosEntrega.fecha}
                        onChange={(e) => setDatosEntrega({ ...datosEntrega, fecha: e.target.value })}
                        className="campo-texto"
                        required
                      />
                    </div>

                    <div className="campo-grupo">
                      <label>Modalidad</label>
                      <select
                        value={datosEntrega.modalidad}
                        onChange={(e) => setDatosEntrega({ ...datosEntrega, modalidad: e.target.value })}
                        className="campo-texto"
                      >
                        <option value="Retiro por taller">Retiro por taller (Sin costo)</option>
                        <option value="Envío a domicilio">Envío a domicilio (A coordinar)</option>
                      </select>
                    </div>
                  </div>

                  <div className="campo-grupo">
                    <label>Aclaraciones / Notas adicionales:</label>
                    <textarea
                      placeholder="Ej: Pasar a retirar a las 17hs, escribir con letras doradas, etc."
                      value={datosEntrega.notas}
                      onChange={(e) => setDatosEntrega({ ...datosEntrega, notas: e.target.value })}
                      className="campo-texto"
                      rows="3"
                    />
                  </div>

                  <button type="button" onClick={sendWhatsApp} className="boton-whatsapp">
                    💬 Enviar Pedido por WhatsApp
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* PESTAÑA: TORTAS A MEDIDA */}
            {activeTab === 'custom' && (
              <div>
                <div className="banner-bienvenida">
                  <h2>Diseñá tu Torta Soñada 🎂</h2>
                  <p>Elegí el estilo, tamaño, bizcochuelo y hasta 3 rellenos favoritos.</p>
                </div>

                <div className="diseno-grid-torta">
                  <div className="columna-pasos">
                    <div className="tarjeta-paso">
                      <div className="encabezado-paso">
                        <span className="numero-paso">1</span>
                        <h3>Elegí el Estilo / Cobertura:</h3>
                      </div>
                      <div className="grilla-opciones">
                        {cakeOptions.estilos.map((item) => (
                          <div
                            key={item._id || item.nombre}
                            onClick={() => setCustomCake({ ...customCake, estilo: item })}
                            className={`tarjeta-opcion ${customCake.estilo?.nombre === item.nombre ? 'seleccionada' : ''}`}
                          >
                            <strong className="nombre-opcion">{item.nombre}</strong>
                            <span className="precio-opcion">
                              {item.precio > 0 ? `+${formatPrice(item.precio)}` : 'Incluido'}
                            </span>
                            {item.descripcion && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--texto-gris)', marginTop: '4px' }}>
                                {item.descripcion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tarjeta-paso">
                      <div className="encabezado-paso">
                        <span className="numero-paso">2</span>
                        <h3>Tamaño (Porciones):</h3>
                      </div>
                      <div className="grilla-opciones">
                        {cakeOptions.tamanos.map((t) => (
                          <div
                            key={t._id || t.nombre}
                            onClick={() => handleSelectTamano(t)}
                            className={`tarjeta-opcion ${customCake.tamano?.nombre === t.nombre ? 'seleccionada' : ''}`}
                          >
                            <strong className="nombre-opcion">{t.nombre}</strong>
                            <span className="precio-opcion" style={{ color: 'var(--rosa-principal)' }}>
                              Base: {formatPrice(t.precio)}
                            </span>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.72rem',
                                background: customCake.tamano?.nombre === t.nombre ? 'var(--rosa-principal)' : 'var(--rosa-suave)',
                                color: customCake.tamano?.nombre === t.nombre ? '#ffffff' : 'var(--rosa-principal)',
                                padding: '2px 7px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                marginTop: '4px'
                              }}
                            >
                              ⚡ Admite hasta {t.maxRellenos || 1} {t.maxRellenos === 1 ? 'relleno' : 'rellenos'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tarjeta-paso">
                      <div className="encabezado-paso">
                        <span className="numero-paso">3</span>
                        <h3>Sabor del Bizcochuelo:</h3>
                      </div>
                      <div className="grilla-opciones">
                        {cakeOptions.bizcochuelos.map((biz) => (
                          <div
                            key={biz._id || biz.nombre}
                            onClick={() => setCustomCake({ ...customCake, bizcochuelo: biz })}
                            className={`tarjeta-opcion ${customCake.bizcochuelo?.nombre === biz.nombre ? 'seleccionada' : ''}`}
                          >
                            <strong className="nombre-opcion">{biz.nombre}</strong>
                            <span className="precio-opcion">
                              {biz.precio > 0 ? `+${formatPrice(biz.precio)}` : 'Sin cargo'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tarjeta-paso">
                      <div className="encabezado-paso espacio-entre">
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <span className="numero-paso">4</span>
                          <h3>Rellenos Favoritos:</h3>
                        </div>
                        <span className="badge-etiqueta" style={{ fontWeight: 700 }}>
                          {customCake.rellenos.length} / {maxRellenosPermitidos} seleccionados
                        </span>
                      </div>
                      <div style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: 'var(--texto-gris)' }}>
                        ⚡ Para el tamaño <strong>{customCake.tamano?.nombre}</strong> podés elegir hasta <strong>{maxRellenosPermitidos} {maxRellenosPermitidos === 1 ? 'relleno' : 'rellenos'}</strong>.
                      </div>
                      <div className="grilla-opciones">
                        {cakeOptions.rellenos.map((r) => {
                          const active = customCake.rellenos.some((item) => (item._id && item._id === r._id) || item.nombre === r.nombre);
                          const reachesLimit = customCake.rellenos.length >= maxRellenosPermitidos && maxRellenosPermitidos > 1 && !active;
                          return (
                            <div
                              key={r._id || r.nombre}
                              onClick={() => toggleRelleno(r)}
                              className={`tarjeta-opcion ${active ? 'seleccionada' : ''}`}
                              style={{
                                opacity: reachesLimit ? 0.5 : 1,
                                cursor: reachesLimit ? 'not-allowed' : 'pointer'
                              }}
                              title={reachesLimit ? `Límite alcanzado (${maxRellenosPermitidos} rellenos)` : ''}
                            >
                              <strong className="nombre-opcion">{r.nombre} {active && '✓'}</strong>
                              <span className="precio-opcion">
                                {r.precio > 0 ? `+${formatPrice(r.precio)}` : 'Sin cargo'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="tarjeta-paso">
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
                        Detalles o mensaje en la torta (opcional):
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: '¡Feliz Cumple Sofía!' o indicar sin frutos secos"
                        value={customCake.mensaje}
                        onChange={(e) => setCustomCake({ ...customCake, mensaje: e.target.value })}
                        className="campo-texto"
                      />
                      <button onClick={agregarTortaPersonalizada} className="boton-confirmar" type="button">
                        ⊕ Agregar Torta al Pedido ({formatPrice(precioTortaActual)})
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="tarjeta-resumen-fija">
                      <div className="encabezado-resumen">
                        <h3 className="titulo-resumen">Vista Previa</h3>
                        <span className="badge-etiqueta">Personalizada</span>
                      </div>

                      <div className="caja-ilustracion-torta">
                        <div className="grafico-torta">
                          <div className="cobertura-top">♥ HechoByGaby</div>
                          <div className="bizcochuelo-cuerpo">{customCake.bizcochuelo.nombre}</div>
                          <div className="plato-base"></div>
                        </div>
                      </div>

                      <div className="resumen-lista-detalles">
                        <div className="fila-detalle">
                          <span className="label-det">Estilo:</span>
                          <strong className="val-det">{customCake.estilo.nombre}</strong>
                        </div>
                        <div className="fila-detalle">
                          <span className="label-det">Tamaño:</span>
                          <strong className="val-det">{customCake.tamano.nombre}</strong>
                        </div>
                        <div className="fila-detalle">
                          <span className="label-det">Bizcochuelo:</span>
                          <strong className="val-det">{customCake.bizcochuelo.nombre}</strong>
                        </div>

                        <div className="fila-detalle columna">
                          <span className="label-det">Rellenos seleccionados:</span>
                          {customCake.rellenos.length === 0 ? (
                            <span className="val-det" style={{ fontStyle: 'italic', color: 'var(--texto-gris)' }}>
                              Sin rellenos
                            </span>
                          ) : (
                            customCake.rellenos.map((r) => (
                              <strong key={r.nombre} className="val-det destacado">
                                • {r.nombre}
                              </strong>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="bloque-total-est">
                        <span className="label-total">Total Estimado:</span>
                        <span className="monto-total">{formatPrice(precioTortaActual)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: TARTAS & CLÁSICOS */}
            {activeTab === 'classics' && (
              <div>
                <div className="banner-bienvenida">
                  <h2>Personalizá tu Tarta Tradicional 🥧</h2>
                  <p>Elegí tu sabor favorito, el tamaño ideal y la crema según corresponda.</p>
                </div>

                <div className="diseno-grid-torta">
                  <div className="columna-pasos">
                    <div className="tarjeta-paso">
                      <div className="encabezado-paso">
                        <span className="numero-paso">1</span>
                        <h3>Elegí el Sabor de la Tarta:</h3>
                      </div>
                      <div className="grilla-opciones">
                        {SABORES_TARTAS.map((item) => (
                          <div
                            key={item.nombre}
                            onClick={() => setCustomTarta({ ...customTarta, sabor: item })}
                            className={`tarjeta-opcion ${customTarta.sabor.nombre === item.nombre ? 'seleccionada' : ''}`}
                          >
                            <strong className="nombre-opcion">{item.emoji} {item.nombre}</strong>
                            <span className="precio-opcion">Desde {formatPrice(item.precio)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tarjeta-paso">
                      <div className="encabezado-paso">
                        <span className="numero-paso">2</span>
                        <h3>Tamaño (Porciones):</h3>
                      </div>
                      <div className="grilla-opciones">
                        {TAMANOS_TARTAS.map((tam) => (
                          <div
                            key={tam.nombre}
                            onClick={() => setCustomTarta({ ...customTarta, tamano: tam })}
                            className={`tarjeta-opcion ${customTarta.tamano.nombre === tam.nombre ? 'seleccionada' : ''}`}
                          >
                            <strong className="nombre-opcion">{tam.nombre}</strong>
                            {tam.extra > 0 && <span className="precio-opcion">+{formatPrice(tam.extra)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {customTarta.sabor.requiereCrema && (
                      <div className="tarjeta-paso">
                        <div className="encabezado-paso">
                          <span className="numero-paso">3</span>
                          <h3>Tipo de Crema / Relleno Base:</h3>
                        </div>
                        <div className="grilla-opciones">
                          {CREMAS_TARTAS.map((c) => (
                            <div
                              key={c}
                              onClick={() => setCustomTarta({ ...customTarta, crema: c })}
                              className={`tarjeta-opcion ${customTarta.crema === c ? 'seleccionada' : ''}`}
                            >
                              <strong className="nombre-opcion">{c}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="tarjeta-resumen-fija">
                      <div className="encabezado-resumen">
                        <h3 className="titulo-resumen">Vista Previa</h3>
                        <span className="badge-etiqueta">Tarta Clásica</span>
                      </div>

                      <div className="caja-ilustracion-torta">
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '3.5rem' }}>{customTarta.sabor.emoji}</span>
                          <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--texto-oscuro)' }}>
                            {customTarta.sabor.nombre}
                          </div>
                          {customTarta.sabor.requiereCrema && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--texto-gris)' }}>
                              ({customTarta.crema})
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="resumen-lista-detalles">
                        <div className="fila-detalle">
                          <span className="label-det">Sabor:</span>
                          <strong className="val-det destacado">{customTarta.sabor.nombre}</strong>
                        </div>
                        {customTarta.sabor.requiereCrema && (
                          <div className="fila-detalle">
                            <span className="label-det">Relleno / Crema:</span>
                            <strong className="val-det">{customTarta.crema}</strong>
                          </div>
                        )}
                        <div className="fila-detalle">
                          <span className="label-det">Tamaño:</span>
                          <strong className="val-det">{customTarta.tamano.nombre}</strong>
                        </div>
                      </div>

                      <div className="bloque-total-est">
                        <span className="label-total">Total Estimado:</span>
                        <span className="monto-total">{formatPrice(precioTartaActual)}</span>
                      </div>

                      <button onClick={agregarTartaPersonalizada} className="boton-confirmar" type="button">
                        🛒 Agregar Tarta al Pedido
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: ARMÁ TU DESAYUNO / STOCK */}
            {activeTab === 'breakfast' && (
              <div>
                <div className="banner-bienvenida">
                  <h2>Armá tu Caja de Desayuno & Productos en Stock ☕</h2>
                  <p>Elegí entre nuestras opciones frescas preparadas artesanalmente para regalar o disfrutar.</p>
                </div>

                <div className="barra-pildoras-categorias">
                  {['Todos', 'Desayunos', 'Dulces', 'Salados', 'Bebidas', 'Tortas', 'Tartas'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSubCatDesayuno(cat)}
                      className={`pildora-cat ${subCatDesayuno === cat ? 'activa' : ''}`}
                      type="button"
                    >
                      {cat === 'Desayunos' && '☕ '}
                      {cat === 'Dulces' && '🥐 '}
                      {cat === 'Salados' && '🥪 '}
                      {cat === 'Bebidas' && '🥤 '}
                      {cat === 'Tortas' && '🎂 '}
                      {cat === 'Tartas' && '🥧 '}
                      {cat === 'Desayunos' ? 'Armá tu Desayuno' : cat}
                    </button>
                  ))}
                </div>

                {subCatDesayuno === 'Desayunos' ? (
                  <ArmaTuDesayuno onAddToCart={addToCart} />
                ) : loadingProducts ? (
                  <p style={{ textAlign: 'center', padding: '20px', color: 'var(--texto-gris)' }}>Cargando catálogo...</p>
                ) : (
                  <div className="grilla-productos-stock">
                    {productosStock
                      .filter((item) => subCatDesayuno === 'Todos' || item.categoria === subCatDesayuno)
                      .map((item) => (
                        <div key={item._id || item.id} className="card-item-stock" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            {item.imagen ? (
                              <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', background: 'var(--rosa-fondo)' }}>
                                <img
                                  src={getProductImageUrl(item.imagen)}
                                  alt={item.nombre}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.innerText = item.emoji || '🧁';
                                  }}
                                />
                              </div>
                            ) : (
                              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '6px' }}>{item.emoji || '🧁'}</span>
                            )}
                            <strong className="nombre-opcion">{item.nombre}</strong>
                            {item.descripcion && (
                              <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', margin: '4px 0 8px 0' }}>
                                {item.descripcion}
                              </p>
                            )}
                            {Array.isArray(item.opciones) && item.opciones.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                {item.opciones.map((opt) => (
                                  <span key={opt} style={{ fontSize: '0.7rem', background: 'var(--rosa-suave)', color: 'var(--rosa-principal)', padding: '1px 6px', borderRadius: '8px' }}>
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span className="precio-opcion" style={{ fontSize: '1rem' }}>{formatPrice(item.precio)}</span>
                            <button
                              onClick={() =>
                                addToCart(
                                  {
                                    nombre: item.nombre,
                                    precio: item.precio,
                                    detalle: item.descripcion || item.categoria
                                  },
                                  item._id || item.nombre
                                )
                              }
                              className={`btn-sumar-restar ${recentlyAddedId === (item._id || item.nombre) ? 'btn-sumar-exito' : ''}`}
                              title="Agregar al pedido"
                              type="button"
                            >
                              {recentlyAddedId === (item._id || item.nombre) ? '✓' : '+'}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA: GALERÍA */}
            {activeTab === 'gallery' && (
              <div>
                <div className="banner-bienvenida">
                  <h2>Nuestros Trabajos 📷</h2>
                  <p>Mirá algunas de las creaciones que preparamos con mucho amor para nuestros clientes.</p>
                </div>

                {/* BOTONES DE FILTRO POR CATEGORÍA EN GALERÍA */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.4rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem',
                    justifyContent: 'center'
                  }}
                >
                  {['Todos', 'Tortas', 'Tartas', 'Cajas de Desayuno', 'Mesa Dulce'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaGaleria(cat)}
                      className={`pestana ${categoriaGaleria === cat ? 'activa' : ''}`}
                      style={{
                        border: '1px solid var(--rosa-borde)',
                        borderRadius: '20px',
                        padding: '0.4rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: categoriaGaleria === cat ? 'var(--rosa-principal)' : 'var(--blanco-card)',
                        color: categoriaGaleria === cat ? '#ffffff' : 'var(--texto-oscuro)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat === 'Tortas' && '🎂 '}
                      {cat === 'Tartas' && '🥧 '}
                      {cat === 'Cajas de Desayuno' && '☕ '}
                      {cat === 'Mesa Dulce' && '🧁 '}
                      {cat}
                    </button>
                  ))}
                </div>

                {/* GRILLA DE FOTOS FILTRABLE */}
                {(() => {
                  const trabajosVisibles = (dbGallery.length > 0 ? dbGallery : GALERIA_TRABAJOS).filter(
                    (t) => categoriaGaleria === 'Todos' || t.categoria === categoriaGaleria
                  );

                  if (trabajosVisibles.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--blanco-card)', borderRadius: '16px', border: '1px dashed var(--rosa-borde)' }}>
                        <p style={{ color: 'var(--texto-gris)' }}>No hay fotos cargadas en esta categoría por el momento.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grilla-galeria">
                      {trabajosVisibles.map((trabajo) => {
                        const imagenUrl = trabajo.imagen ? getProductImageUrl(trabajo.imagen) : null;
                        return (
                          <div key={trabajo._id || trabajo.id} className="tarjeta-galeria">
                            <div
                              className="placeholder-foto"
                              style={{
                                overflow: 'hidden',
                                padding: 0,
                                background: 'var(--rosa-fondo)',
                                height: '180px',
                                position: 'relative'
                              }}
                            >
                              {imagenUrl ? (
                                <img
                                  src={imagenUrl}
                                  alt={trabajo.titulo}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.innerText = trabajo.emoji || '🎂';
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '3rem' }}>{trabajo.emoji || '🎂'}</span>
                              )}

                              {trabajo.precio > 0 && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '8px',
                                    background: 'rgba(0, 0, 0, 0.75)',
                                    color: '#ffffff',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '8px'
                                  }}
                                >
                                  Ref: {formatPrice(trabajo.precio)}
                                </span>
                              )}
                            </div>

                            <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                              <div>
                                {trabajo.categoria && (
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      background: 'var(--rosa-suave)',
                                      color: 'var(--rosa-principal)',
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                      fontWeight: 'bold',
                                      display: 'inline-block',
                                      marginBottom: '4px'
                                    }}
                                  >
                                    {trabajo.categoria}
                                  </span>
                                )}
                                <h4 style={{ fontFamily: 'Georgia, serif', margin: '0.2rem 0 0.3rem 0', color: 'var(--texto-oscuro)' }}>
                                  {trabajo.titulo}
                                </h4>
                                {trabajo.descripcion && (
                                  <p style={{ fontSize: '0.8rem', color: 'var(--texto-gris)', lineHeight: 1.35 }}>
                                    {trabajo.descripcion}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const msg = `¡Hola Hecho by Gaby! 🍰 Me encantó este trabajo de la galería: "${trabajo.titulo}" (${trabajo.categoria || 'Pastelería'}). ¿Quisiera consultar presupuesto y disponibilidad?`;
                                  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="boton-admin-link"
                                style={{
                                  marginTop: '10px',
                                  width: '100%',
                                  justifyContent: 'center',
                                  fontSize: '0.78rem',
                                  padding: '0.45rem',
                                  borderColor: 'var(--verde-whatsapp)',
                                  color: 'var(--texto-oscuro)'
                                }}
                              >
                                💬 Consultar por WhatsApp
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* PESTAÑA: PREGUNTAS FRECUENTES */}
            {activeTab === 'faq' && (
              <div>
                <div className="banner-bienvenida">
                  <h2>Preguntas Frecuentes ❓</h2>
                  <p>Todo lo que necesitás saber antes de hacer tu pedido.</p>
                </div>

                <div className="tarjeta-paso">
                  <h3 style={{ color: 'var(--rosa-principal)', marginBottom: '0.4rem' }}>¿Con cuánta anticipación debo hacer mi pedido?</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--texto-gris)' }}>
                    Para tortas personalizadas pedimos al menos 48 a 72hs de anticipación para garantizar disponibilidad y la frescura de los ingredientes.
                  </p>
                </div>
                <div className="tarjeta-paso">
                  <h3 style={{ color: 'var(--rosa-principal)', marginBottom: '0.4rem' }}>¿Hacen envíos a domicilio?</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--texto-gris)' }}>
                    Sí, realizamos envíos coordinados en la zona o podés retirar directamente por nuestro taller sin costo extra.
                  </p>
                </div>
                <div className="tarjeta-paso">
                  <h3 style={{ color: 'var(--rosa-principal)', marginBottom: '0.4rem' }}>¿Cómo se realiza el pago?</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--texto-gris)' }}>
                    Al enviar el pedido por WhatsApp coordinamos la seña del 50% por transferencia bancaria o Mercado Pago para reservar la fecha, y el saldo se abona al momento de la entrega o retiro.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NOTIFICACIÓN TOAST FLOTANTE DE CONFIRMACIÓN */}
      {cartToast.visible && cartToast.item && (
        <div className="cart-toast-contenedor" role="status" aria-live="polite">
          <div className="cart-toast-icono">🛍️</div>
          <div className="cart-toast-contenido">
            <strong className="cart-toast-titulo">¡Agregado al pedido!</strong>
            <span className="cart-toast-descripcion">
              {cartToast.item.nombre}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('resumen');
              setCartToast({ visible: false, item: null });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="cart-toast-boton-ver"
          >
            Ver Pedido 🛒
          </button>
          <button
            type="button"
            onClick={() => setCartToast({ visible: false, item: null })}
            className="cart-toast-boton-cerrar"
            title="Cerrar notificación"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
