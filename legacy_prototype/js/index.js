/* ==========================================================================
   CONFIGURACIÓN GENERAL & CONSTANTES
   ========================================================================== */
var WHATSAPP_NUMERO = "5491112345678"; // Reemplazar con el número real de HechoByGaby

// 1. Tortas a Medida
var TORTA_OPCIONES = {
  coberturas: [
    { id: 'drip', nombre: 'Drip Cake', precio: 12000, color: '#ff4d6d' },
    { id: 'buttercream', nombre: 'Buttercream Liso', precio: 10000, color: '#fef08a' },
    { id: 'naked', nombre: 'Naked Cake (Rústico)', precio: 9000, color: '#fed7aa' }
  ],
  tamanos: [
    { id: 'chica', nombre: 'Chica (8 - 10 porciones)', extra: 0 },
    { id: 'mediana', nombre: 'Mediana (12 - 15 porciones)', extra: 4000 },
    { id: 'grande', nombre: 'Grande (20 - 25 porciones)', extra: 8000 }
  ],
  bizcochuelos: [
    { id: 'vainilla', nombre: 'Vainilla Tradicional', extra: 0 },
    { id: 'chocolate', nombre: 'Chocolate Intenso', extra: 1000 },
    { id: 'redvelvet', nombre: 'Red Velvet', extra: 2000 }
  ],
  rellenos: [
    { id: 'ddl', nombre: 'Dulce de Leche Clásico', extra: 0 },
    { id: 'nutella', nombre: 'Nutella y Avellanas', extra: 2000 },
    { id: 'frutilla', nombre: 'Crema con Frutillas', extra: 1500 },
    { id: 'oreo', nombre: 'Crema Oreo', extra: 1200 }
  ]
};

// 2. Tartas Tradicionales
var TARTA_TRADICIONAL_OPCIONES = {
  sabores: [
    { 
      id: 'frutilla', 
      nombre: 'Tarta de Frutillas', 
      precioBase: 8500, 
      img: '🍓',
      cremas: [
        { id: 'chantilly', nombre: 'Crema Chantilly', extra: 0 },
        { id: 'pastelera', nombre: 'Crema Pastelera', extra: 0 }
      ]
    },
    { 
      id: 'durazno', 
      nombre: 'Tarta de Durazno', 
      precioBase: 7800, 
      img: '🍑',
      cremas: [
        { id: 'chantilly', nombre: 'Crema Chantilly', extra: 0 },
        { id: 'pastelera', nombre: 'Crema Pastelera', extra: 0 }
      ]
    },
    { 
      id: 'toffy', 
      nombre: 'Tarta Toffy', 
      precioBase: 8200, 
      img: '🍫',
      cremas: [
        { id: 'ddl_chocolate', nombre: 'Dulce de Leche y Chocolate', extra: 0 }
      ]
    },
    { 
      id: 'lemon', 
      nombre: 'Lemon Pie Clásico', 
      precioBase: 8000, 
      img: '🍋',
      cremas: [
        { id: 'curd_merengue', nombre: 'Crema de Limón y Merengue', extra: 0 }
      ]
    }
  ],
  tamanos: [
    { id: 'chica', nombre: 'Chica de 20cm (6 - 8 porciones)', extra: 0 },
    { id: 'mediana', nombre: 'Mediana de 24cm (10 - 12 porciones)', extra: 3500 },
    { id: 'grande', nombre: 'Grande de 28cm (14 - 16 porciones)', extra: 6500 }
  ]
};

// 3. Desayunos / Stock
var PRODUCTOS_DESAYUNO = [
  { id: 'd1', nombre: 'Medialuna de Manteca', categoria: 'dulce', precio: 800, stock: 12, img: '🥐' },
  { id: 'd2', nombre: 'Muffin de Arándanos', categoria: 'dulce', precio: 1500, stock: 6, img: '🧁' },
  { id: 'd3', nombre: 'Sándwich de Miga', categoria: 'salado', precio: 1800, stock: 8, img: '🥪' },
  { id: 'd4', nombre: 'Jugo de Naranja Natural', categoria: 'bebida', precio: 1600, stock: 5, img: '🍊' }
];

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */
var tortaSeleccion = {
  cobertura: TORTA_OPCIONES.coberturas[0],
  tamano: TORTA_OPCIONES.tamanos[0],
  bizcochuelo: TORTA_OPCIONES.bizcochuelos[0],
  rellenos: [TORTA_OPCIONES.rellenos[0]]
};

var tartaTradicionalSeleccion = {
  sabor: TARTA_TRADICIONAL_OPCIONES.sabores[0],
  crema: TARTA_TRADICIONAL_OPCIONES.sabores[0].cremas[0],
  tamano: TARTA_TRADICIONAL_OPCIONES.tamanos[0]
};

var carrito = [];
var itemsDesayunoSeleccionados = {};

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */
window.onload = function() {
  initIcons();
  initTheme();
  renderTortaForm();
  updateTortaPreview();
};

function initIcons() {
  try {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (e) {
    console.log("Lucide cargando...", e);
  }
}

function initTheme() {
  var toggleBtn = document.getElementById('themeToggle');
  var icon = document.getElementById('themeIcon');
  
  if (toggleBtn) {
    toggleBtn.onclick = function() {
      var html = document.documentElement;
      var isDark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
      }
      initIcons();
    };
  }
}

function switchTab(tab) {
  var secciones = ['secTorta', 'secTartas', 'secDesayuno', 'secGaleria', 'secFaq', 'secCarrito'];
  for (var i = 0; i < secciones.length; i++) {
    var el = document.getElementById(secciones[i]);
    if (el) el.className = 'seccion-oculta';
  }
  
  var pestañas = document.querySelectorAll('.pestana');
  pestañas.forEach(function(p) { p.classList.remove('activa'); });

  if (tab === 'torta') {
    if (document.getElementById('secTorta')) document.getElementById('secTorta').className = 'seccion-activa';
    if (document.getElementById('tabTorta')) document.getElementById('tabTorta').classList.add('activa');
    renderTortaForm();
  } else if (tab === 'tartas') {
    if (document.getElementById('secTartas')) document.getElementById('secTartas').className = 'seccion-activa';
    if (document.getElementById('tabTartas')) document.getElementById('tabTartas').classList.add('activa');
    renderTartasForm();
  } else if (tab === 'desayuno') {
    if (document.getElementById('secDesayuno')) document.getElementById('secDesayuno').className = 'seccion-activa';
    if (document.getElementById('tabDesayuno')) document.getElementById('tabDesayuno').classList.add('activa');
    renderDesayunoGrid();
  } else if (tab === 'galeria') {
    if (document.getElementById('secGaleria')) document.getElementById('secGaleria').className = 'seccion-activa';
    if (document.getElementById('tabGaleria')) document.getElementById('tabGaleria').classList.add('activa');
  } else if (tab === 'faq') {
    if (document.getElementById('secFaq')) document.getElementById('secFaq').className = 'seccion-activa contenedor-reducido';
    if (document.getElementById('tabFaq')) document.getElementById('tabFaq').classList.add('activa');
  } else if (tab === 'carrito') {
    if (document.getElementById('secCarrito')) document.getElementById('secCarrito').className = 'seccion-activa contenedor-reducido';
    if (document.getElementById('tabCarrito')) document.getElementById('tabCarrito').classList.add('activa');
    renderCarrito();
  }
  initIcons();
}

/* ==========================================================================
   RENDER SECCIÓN TORTAS
   ========================================================================== */
function renderTortaForm() {
  var cobEl = document.getElementById('coberturaOptions');
  if (cobEl) {
    cobEl.innerHTML = TORTA_OPCIONES.coberturas.map(function(c) {
      var sel = tortaSeleccion.cobertura.id === c.id ? 'seleccionada' : '';
      return '<button onclick="selectCobertura(\'' + c.id + '\')" class="tarjeta-opcion ' + sel + '">' +
        '<span class="nombre-opcion">' + c.nombre + '</span>' +
        '<span class="precio-opcion">Desde $' + c.precio.toLocaleString() + '</span>' +
        '</button>';
    }).join('');
  }

  var tamEl = document.getElementById('tamanoOptions');
  if (tamEl) {
    tamEl.innerHTML = TORTA_OPCIONES.tamanos.map(function(t) {
      var sel = tortaSeleccion.tamano.id === t.id ? 'seleccionada' : '';
      return '<button onclick="selectTamano(\'' + t.id + '\')" class="tarjeta-opcion ' + sel + '">' +
        '<span class="nombre-opcion">' + t.nombre + '</span>' +
        '</button>';
    }).join('');
  }

  var bizEl = document.getElementById('bizcochueloOptions');
  if (bizEl) {
    bizEl.innerHTML = TORTA_OPCIONES.bizcochuelos.map(function(b) {
      var sel = tortaSeleccion.bizcochuelo.id === b.id ? 'seleccionada' : '';
      return '<button onclick="selectBizcochuelo(\'' + b.id + '\')" class="tarjeta-opcion ' + sel + '">' +
        '<span class="nombre-opcion">' + b.nombre + '</span>' +
        '</button>';
    }).join('');
  }

  renderRellenosOptions();
}

function renderRellenosOptions() {
  var countEl = document.getElementById('rellenosCount');
  if (countEl) countEl.innerText = tortaSeleccion.rellenos.length + '/3 seleccionados';

  var relEl = document.getElementById('rellenosOptions');
  if (relEl) {
    relEl.innerHTML = TORTA_OPCIONES.rellenos.map(function(r) {
      var isSelected = tortaSeleccion.rellenos.some(function(item) { return item.id === r.id; });
      var sel = isSelected ? 'seleccionada' : '';
      return '<button onclick="toggleRelleno(\'' + r.id + '\')" class="tarjeta-opcion ' + sel + '">' +
        '<span class="nombre-opcion">' + r.nombre + '</span>' +
        '</button>';
    }).join('');
  }
}

function selectCobertura(id) {
  tortaSeleccion.cobertura = TORTA_OPCIONES.coberturas.find(function(c) { return c.id === id; });
  renderTortaForm();
  updateTortaPreview();
}

function selectTamano(id) {
  tortaSeleccion.tamano = TORTA_OPCIONES.tamanos.find(function(t) { return t.id === id; });
  renderTortaForm();
  updateTortaPreview();
}

function selectBizcochuelo(id) {
  tortaSeleccion.bizcochuelo = TORTA_OPCIONES.bizcochuelos.find(function(b) { return b.id === id; });
  renderTortaForm();
  updateTortaPreview();
}

function toggleRelleno(id) {
  var index = tortaSeleccion.rellenos.findIndex(function(r) { return r.id === id; });
  if (index > -1) {
    if (tortaSeleccion.rellenos.length > 1) tortaSeleccion.rellenos.splice(index, 1);
  } else {
    if (tortaSeleccion.rellenos.length < 3) {
      var item = TORTA_OPCIONES.rellenos.find(function(r) { return r.id === id; });
      if (item) tortaSeleccion.rellenos.push(item);
    }
  }
  renderRellenosOptions();
  updateTortaPreview();
}

function calcularPrecioTorta() {
  var total = tortaSeleccion.cobertura.precio + tortaSeleccion.tamano.extra + tortaSeleccion.bizcochuelo.extra;
  tortaSeleccion.rellenos.forEach(function(r) { total += r.extra; });
  return total;
}

function updateTortaPreview() {
  var total = calcularPrecioTorta();
  var precioEl = document.getElementById('tortaPrecioTotal');
  if (precioEl) precioEl.innerText = '$' + total.toLocaleString();

  var estEl = document.getElementById('txtEstilo');
  if (estEl) estEl.innerText = tortaSeleccion.cobertura.nombre;

  var tamEl = document.getElementById('txtTamano');
  if (tamEl) tamEl.innerText = tortaSeleccion.tamano.nombre;

  var bizEl = document.getElementById('txtBizcochuelo');
  if (bizEl) bizEl.innerText = tortaSeleccion.bizcochuelo.nombre;

  var relEl = document.getElementById('txtRellenos');
  if (relEl) relEl.innerText = tortaSeleccion.rellenos.map(function(r) { return r.nombre; }).join(', ');

  var topEl = document.getElementById('visualTop');
  if (topEl) topEl.style.backgroundColor = tortaSeleccion.cobertura.color;
}

function agregarTortaAlCarrito() {
  var notasEl = document.getElementById('tortaNotas');
  var notas = notasEl ? notasEl.value.trim() : '';
  var precio = calcularPrecioTorta();

  carrito.push({
    id: 'torta_' + Date.now(),
    tipo: 'Torta Personalizada',
    detalle: tortaSeleccion.cobertura.nombre + ' | ' + tortaSeleccion.tamano.nombre + ' | ' + tortaSeleccion.bizcochuelo.nombre + ' | Rellenos: ' + tortaSeleccion.rellenos.map(function(r) { return r.nombre; }).join(', ') + (notas ? ' | Mensaje: "' + notas + '"' : ''),
    precio: precio
  });

  actualizarBadgeCarrito();
  switchTab('carrito');
}

/* ==========================================================================
   RENDER SECCIÓN TARTAS
   ========================================================================== */
function renderTartasForm() {
  var saborEl = document.getElementById('tartaSaborOptions');
  if (saborEl) {
    saborEl.innerHTML = TARTA_TRADICIONAL_OPCIONES.sabores.map(function(s) {
      var sel = tartaTradicionalSeleccion.sabor.id === s.id ? 'seleccionada' : '';
      return '<button onclick="selectTartaSabor(\'' + s.id + '\')" class="tarjeta-opcion ' + sel + '">' +
        '<span class="nombre-opcion">' + s.img + ' ' + s.nombre + '</span>' +
        '<span class="precio-opcion">Desde $' + s.precioBase.toLocaleString() + '</span>' +
        '</button>';
    }).join('');
  }

  var tamEl = document.getElementById('tartaTamanoOptions');
  if (tamEl) {
    tamEl.innerHTML = TARTA_TRADICIONAL_OPCIONES.tamanos.map(function(t) {
      var sel = tartaTradicionalSeleccion.tamano.id === t.id ? 'seleccionada' : '';
      return '<button onclick="selectTartaTamano(\'' + t.id + '\')" class="tarjeta-opcion ' + sel + '">' +
        '<span class="nombre-opcion">' + t.nombre + '</span>' +
        '</button>';
    }).join('');
  }

  var cremaEl = document.getElementById('tartaCremaOptions');
  if (cremaEl) {
    var cremasDisponibles = tartaTradicionalSeleccion.sabor.cremas;
    cremaEl.innerHTML = cremasDisponibles.map(function(c) {
      var sel = tartaTradicionalSeleccion.crema.id === c.id ? 'seleccionada' : '';
      return '<button onclick="selectTartaCrema(\'' + c.id + '\')" class="tarjeta-opcion ' + sel + '">' +
        '<span class="nombre-opcion">' + c.nombre + '</span>' +
        '</button>';
    }).join('');
  }

  updateTartaTradicionalPreview();
}

function selectTartaSabor(id) {
  tartaTradicionalSeleccion.sabor = TARTA_TRADICIONAL_OPCIONES.sabores.find(function(s) { return s.id === id; });
  tartaTradicionalSeleccion.crema = tartaTradicionalSeleccion.sabor.cremas[0];
  renderTartasForm();
}

function selectTartaCrema(id) {
  tartaTradicionalSeleccion.crema = tartaTradicionalSeleccion.sabor.cremas.find(function(c) { return c.id === id; });
  renderTartasForm();
}

function selectTartaTamano(id) {
  tartaTradicionalSeleccion.tamano = TARTA_TRADICIONAL_OPCIONES.tamanos.find(function(t) { return t.id === id; });
  renderTartasForm();
}

function calcularPrecioTartaTradicional() {
  return tartaTradicionalSeleccion.sabor.precioBase + tartaTradicionalSeleccion.tamano.extra;
}

function updateTartaTradicionalPreview() {
  var total = calcularPrecioTartaTradicional();
  var totalEl = document.querySelector('#secTartas .monto-total');
  if (totalEl) totalEl.innerText = '$' + total.toLocaleString();

  var sabEl = document.getElementById('txtTartaSabor');
  if (sabEl) sabEl.innerText = tartaTradicionalSeleccion.sabor.nombre;

  var cremEl = document.getElementById('txtTartaCrema');
  if (cremEl) cremEl.innerText = tartaTradicionalSeleccion.crema.nombre;

  var tamEl = document.getElementById('txtTartaTamano');
  if (tamEl) tamEl.innerText = tartaTradicionalSeleccion.tamano.nombre;

  var emojiEl = document.getElementById('visualEmojiTarta');
  if (emojiEl) emojiEl.innerText = tartaTradicionalSeleccion.sabor.img;

  var nomEl = document.getElementById('visualNombreTarta');
  if (nomEl) nomEl.innerText = tartaTradicionalSeleccion.sabor.nombre + ' (' + tartaTradicionalSeleccion.crema.nombre + ')';
}

function agregarTartaTradicionalAlCarrito() {
  var notasEl = document.getElementById('tartaNotas');
  var notas = notasEl ? notasEl.value.trim() : '';
  var precio = calcularPrecioTartaTradicional();

  carrito.push({
    id: 'tarta_' + Date.now(),
    tipo: 'Tarta Tradicional',
    detalle: tartaTradicionalSeleccion.sabor.nombre + ' con ' + tartaTradicionalSeleccion.crema.nombre + ' | ' + tartaTradicionalSeleccion.tamano.nombre + (notas ? ' | Notas: "' + notas + '"' : ''),
    precio: precio
  });

  actualizarBadgeCarrito();
  switchTab('carrito');
}

/* ==========================================================================
   RENDER DESAYUNOS
   ========================================================================== */
function renderDesayunoGrid(categoria) {
  if (!categoria) categoria = 'todos';
  var grid = document.getElementById('gridProductosDesayuno');
  if (!grid) return;

  var filtrados = categoria === 'todos' ? PRODUCTOS_DESAYUNO : PRODUCTOS_DESAYUNO.filter(function(p) { return p.categoria === categoria; });

  grid.innerHTML = filtrados.map(function(p) {
    var cant = itemsDesayunoSeleccionados[p.id] || 0;
    return '<div class="card-item-stock">' +
      '<div>' +
        '<div style="font-size:1.5rem">' + p.img + '</div>' +
        '<span class="nombre-opcion">' + p.nombre + '</span>' +
        '<span class="precio-opcion">$' + p.precio.toLocaleString() + '</span>' +
      '</div>' +
      '<div class="controles-item">' +
        (cant > 0 ? '<button onclick="modificarCantidadDesayuno(\'' + p.id + '\', -1)" class="btn-sumar-restar">-</button><span>' + cant + '</span>' : '') +
        '<button onclick="modificarCantidadDesayuno(\'' + p.id + '\', 1)" class="btn-sumar-restar">+</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function filtrarProductos(cat) {
  document.querySelectorAll('.boton-filtro').forEach(function(b) { b.classList.remove('activo'); });
  if (window.event && window.event.target) {
    window.event.target.classList.add('activo');
  }
  renderDesayunoGrid(cat);
}

function modificarCantidadDesayuno(prodId, delta) {
  var prod = PRODUCTOS_DESAYUNO.find(function(p) { return p.id === prodId; });
  var actual = itemsDesayunoSeleccionados[prodId] || 0;
  var nuevo = actual + delta;

  if (nuevo < 0 || nuevo > prod.stock) return;

  if (nuevo === 0) delete itemsDesayunoSeleccionados[prodId];
  else itemsDesayunoSeleccionados[prodId] = nuevo;

  renderDesayunoGrid();
  sincronizarDesayunosEnCarrito();
}

function sincronizarDesayunosEnCarrito() {
  carrito = carrito.filter(function(item) { return !item.id.startsWith('desayuno_'); });

  Object.keys(itemsDesayunoSeleccionados).forEach(function(id) {
    var prod = PRODUCTOS_DESAYUNO.find(function(p) { return p.id === id; });
    var cant = itemsDesayunoSeleccionados[id];
    
    carrito.push({
      id: 'desayuno_' + prod.id,
      tipo: 'Ítem de Desayuno',
      detalle: prod.img + ' ' + prod.nombre + ' (x' + cant + ')',
      precio: prod.precio * cant
    });
  });

  actualizarBadgeCarrito();
}

/* ==========================================================================
   CARRITO ESTILO CAPTURA (Fila separada con tachito e icono)
   ========================================================================== */
function actualizarBadgeCarrito() {
  var badge = document.getElementById('cartCount');
  if (badge) badge.innerText = carrito.length;
}

function renderCarrito() {
  var container = document.getElementById('listaCarrito');
  var totalContainer = document.getElementById('cartTotal');

  if (!container) return;

  if (carrito.length === 0) {
    container.innerHTML = '<p style="text-align:center; color: var(--texto-gris); padding: 2rem 0;">Tu carrito está vacío.</p>';
    if (totalContainer) totalContainer.innerText = "$0";
    return;
  }

  var totalSum = 0;
  container.innerHTML = carrito.map(function(item) {
    totalSum += item.precio;
    return '<div class="item-carrito-fila">' +
      '<div class="item-carrito-info">' +
        '<div class="item-carrito-titulo-row">' +
          '<strong class="item-carrito-tipo">' + item.tipo + '</strong>' +
          '<button onclick="eliminarDelCarrito(\'' + item.id + '\')" class="btn-eliminar-item" title="Eliminar del carrito">' +
            '<i data-lucide="trash-2"></i>' +
          '</button>' +
        '</div>' +
        '<div class="item-carrito-detalle">' + item.detalle + '</div>' +
        '<div class="item-carrito-precio">$' + item.precio.toLocaleString() + '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  if (totalContainer) totalContainer.innerText = '$' + totalSum.toLocaleString();
  initIcons();
}

function eliminarDelCarrito(id) {
  if (id.startsWith('desayuno_')) {
    delete itemsDesayunoSeleccionados[id.replace('desayuno_', '')];
    renderDesayunoGrid();
  }
  carrito = carrito.filter(function(item) { return item.id !== id; });
  actualizarBadgeCarrito();
  renderCarrito();
}

function enviarPedidoWhatsApp() {
  var nombreEl = document.getElementById('clienteNombre');
  var fechaEl = document.getElementById('clienteFecha');
  var metodoEl = document.getElementById('clienteMetodo');
  var aclaracionesEl = document.getElementById('clienteAclaraciones');

  var nombre = nombreEl ? nombreEl.value.trim() : '';
  var fecha = fechaEl ? fechaEl.value : '';
  var metodo = metodoEl ? metodoEl.value : 'retiro';
  var aclaraciones = aclaracionesEl ? aclaracionesEl.value.trim() : '';

  if (carrito.length === 0 || !nombre || !fecha) {
    alert("Por favor completá tu nombre, fecha y agregá al menos un producto.");
    return;
  }

  var mensaje = "🎂 *NUEVO PEDIDO - HECHOBYGABY* 🎂\n\n";
  mensaje += "👤 *Cliente:* " + nombre + "\n";
  mensaje += "📅 *Fecha:* " + fecha + "\n";
  mensaje += "🚚 *Modalidad:* " + (metodo === 'retiro' ? 'Retiro por local' : 'Envío a domicilio') + "\n\n";
  mensaje += "📋 *DETALLE:*\n";

  var total = 0;
  carrito.forEach(function(item, index) {
    mensaje += "\n*" + (index + 1) + ". " + item.tipo + "*\n   " + item.detalle + "\n   Subtotal: $" + item.precio.toLocaleString() + "\n";
    total += item.precio;
  });

  mensaje += "\n💰 *TOTAL ESTIMADO: $" + total.toLocaleString() + "*\n";
  if (aclaraciones) mensaje += "\n📝 *Aclaraciones:* " + aclaraciones + "\n";

  window.open("https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensaje), '_blank');
}