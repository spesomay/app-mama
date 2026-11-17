// Opciones para Tortas a Medida
export const ESTILOS_TORTA = [
  { nombre: 'Drip Cake', precio: 12000, desc: 'Elegante con goteo de chocolate y detalles' },
  { nombre: 'Buttercream Liso', precio: 10000, desc: 'Acabado suave, prolijo y clásico' },
  { nombre: 'Naked Cake (Rústico)', precio: 9000, desc: 'Capas a la vista con estilo campestre' }
];

export const TAMANOS_TORTA = [
  { nombre: 'Chica (8 - 10 porciones)', extra: 0 },
  { nombre: 'Mediana (12 - 15 porciones)', extra: 4000 },
  { nombre: 'Grande (20 - 25 porciones)', extra: 8000 }
];

export const BIZCOCHUELOS_TORTA = [
  { nombre: 'Vainilla Tradicional', extra: 0 },
  { nombre: 'Chocolate Intenso', extra: 1000 },
  { nombre: 'Red Velvet', extra: 2000 }
];

export const RELLENOS_TORTA = [
  { nombre: 'Dulce de Leche Clásico', extra: 0 },
  { nombre: 'Nutella y Avellanas', extra: 2000 },
  { nombre: 'Crema con Frutillas', extra: 1500 },
  { nombre: 'Crema Oreo', extra: 1200 }
];

// Opciones para Tartas Tradicionales
export const SABORES_TARTAS = [
  { nombre: 'Tarta de Frutillas', precio: 8500, emoji: '🍓', requiereCrema: true },
  { nombre: 'Tarta de Durazno', precio: 7800, emoji: '🍑', requiereCrema: true },
  { nombre: 'Tarta Toffy', precio: 8200, emoji: '🍫', requiereCrema: false },
  { nombre: 'Lemon Pie Clásico', precio: 8000, emoji: '🍋', requiereCrema: false }
];

export const TAMANOS_TARTAS = [
  { nombre: 'Chica de 20cm (6 - 8 porciones)', extra: 0 },
  { nombre: 'Mediana de 24cm (10 - 12 porciones)', extra: 3500 },
  { nombre: 'Grande de 28cm (14 - 16 porciones)', extra: 6500 }
];

export const CREMAS_TARTAS = ['Crema Chantilly', 'Crema Pastelera'];

// Items de respaldo para Stock individual
export const ITEMS_DESAYUNO = [
  { _id: 'd1', nombre: 'Medialuna de Manteca', precio: 800, emoji: '🥐', categoria: 'Dulces', descripcion: 'Horneada en el día' },
  { _id: 'd2', nombre: 'Muffin de Arándanos', precio: 1500, emoji: '🧁', categoria: 'Dulces', descripcion: 'Con frutos frescos' },
  { _id: 'd3', nombre: 'Sándwich de Miga', precio: 900, emoji: '🥪', categoria: 'Salados', descripcion: 'Jamón cocido y queso' },
  { _id: 'd4', nombre: 'Jugo de Naranja Natural', precio: 1600, emoji: '🍊', categoria: 'Bebidas', descripcion: 'Exprimido natural 500ml' }
];

// Items de la Galería de respaldo
export const GALERIA_TRABAJOS = [
  { id: 1, titulo: 'Torta Drip de Chocolate', descripcion: 'Bizcochuelo húmedo de chocolate con doble relleno de Dulce de Leche.', emoji: '🎂' },
  { id: 2, titulo: 'Lemon Pie Artesanal', descripcion: 'Masa sablée crocante, relleno suave de limón y merengue italiano.', emoji: '🍋' },
  { id: 3, titulo: 'Tarta de Frutillas', descripcion: 'Crema pastelera suave con abundante frutilla fresca y gelificación brillante.', emoji: '🍓' },
  { id: 4, titulo: 'Caja de Desayuno Especial', descripcion: 'Sándwiches de miga, muffins caseros, medialunas y jugo natural.', emoji: '🎁' }
];

// ----------------------------------------------------
// CATÁLOGO DE SELECCIÓN LIBRE: "ARMÁ TU DESAYUNO"
// ----------------------------------------------------

export const CATEGORIAS_CREADOR_DESAYUNO = [
  'Todos',
  'Bebidas',
  'Dulces',
  'Salados',
  'Detalles'
];

export const ITEMS_CREADOR_DESAYUNO = [
  // 1. Bebidas e Infusiones
  {
    id: 'beb_cafe',
    categoria: 'Bebidas',
    nombre: 'Café de Especialidad / Cappuccino',
    precio: 1800,
    emoji: '☕',
    desc: 'En frasco hermético listo para calentar o disfrutar frío'
  },
  {
    id: 'beb_te',
    categoria: 'Bebidas',
    nombre: 'Té en Hebras Gourmet con Infusor',
    precio: 2000,
    emoji: '🫖',
    desc: 'Selección en hebras de frutos rojos, menta o Earl Grey'
  },
  {
    id: 'beb_jugo',
    categoria: 'Bebidas',
    nombre: 'Jugo Natural de Naranja 500ml',
    precio: 1600,
    emoji: '🍊',
    desc: 'Exprimido fresco del día en botella de vidrio'
  },
  {
    id: 'beb_choc',
    categoria: 'Bebidas',
    nombre: 'Submarino / Chocolatada Artesanal',
    precio: 1900,
    emoji: '🍫',
    desc: 'Barra de chocolate semiamargo y leche espumada'
  },

  // 3. Opciones Dulces
  {
    id: 'dul_medialuna',
    categoria: 'Dulces',
    nombre: 'Medialuna de Manteca',
    precio: 800,
    emoji: '🥐',
    desc: 'Elaborada artesanalmente con pura manteca'
  },
  {
    id: 'dul_muffin',
    categoria: 'Dulces',
    nombre: 'Muffin de Arándanos y Limón',
    precio: 1500,
    emoji: '🧁',
    desc: 'Masa húmeda con arándanos frescos y toque cítrico'
  },
  {
    id: 'dul_lemon',
    categoria: 'Dulces',
    nombre: 'Mini Lemon Pie Artesanal',
    precio: 2200,
    emoji: '🍋',
    desc: 'Masa crocante con crema suave de limón y merengue'
  },
  {
    id: 'dul_toffy',
    categoria: 'Dulces',
    nombre: 'Mini Tarta Toffy',
    precio: 2200,
    emoji: '🍫',
    desc: 'Abundante dulce de leche y ganache de chocolate'
  },
  {
    id: 'dul_alfajor',
    categoria: 'Dulces',
    nombre: 'Alfajor Marplatense de Chocolate',
    precio: 1300,
    emoji: '🍪',
    desc: 'Relleno de dulce de leche bañado en chocolate cobertura'
  },
  {
    id: 'dul_budin',
    categoria: 'Dulces',
    nombre: 'Porción de Budín Casero',
    precio: 1400,
    emoji: '🍞',
    desc: 'Glaseado de limón o marmolado de vainilla y cacao'
  },

  // 4. Opciones Saladas
  {
    id: 'sal_miga',
    categoria: 'Salados',
    nombre: 'Sándwich de Miga Jamón y Queso',
    precio: 900,
    emoji: '🥪',
    desc: 'Pan de miga extra tierno con jamón cocido y queso de máquina'
  },
  {
    id: 'sal_tostadas',
    categoria: 'Salados',
    nombre: 'Tostadas de Campo con Untables',
    precio: 1700,
    emoji: '🥖',
    desc: 'Tostadas de masa madre con queso crema y mermelada casera'
  },
  {
    id: 'sal_croissant',
    categoria: 'Salados',
    nombre: 'Croissant de Jamón Crudo y Queso',
    precio: 2600,
    emoji: '🥐',
    desc: 'Hojaldre artesanal relleno de jamón crudo seleccionado'
  },

  // 5. Detalles Especiales & Regalos
  {
    id: 'reg_tarjeta',
    categoria: 'Detalles',
    nombre: 'Tarjeta con Dedicatoria Caligrafiada',
    precio: 0,
    emoji: '💌',
    desc: 'Incluye tarjeta con el mensaje que quieras escribir a mano'
  },
  {
    id: 'reg_bombones',
    categoria: 'Detalles',
    nombre: 'Caja con 4 Bombones Artesanales',
    precio: 1900,
    emoji: '🍬',
    desc: 'Chocolates rellenos artesanales en presentación individual'
  },
  {
    id: 'reg_taza',
    categoria: 'Detalles',
    nombre: 'Taza de Cerámica HechoByGaby',
    precio: 3800,
    emoji: '☕',
    desc: 'Taza de cerámica esmaltada de diseño exclusivo'
  },
  {
    id: 'reg_vela',
    categoria: 'Detalles',
    nombre: 'Vela de Cumpleaños / Bengala Festiva',
    precio: 900,
    emoji: '🕯️',
    desc: 'Para soplar las velitas y festejar el momento'
  }
];
