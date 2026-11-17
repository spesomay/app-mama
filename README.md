# 🍰 HechoByGaby — Pastelería Artesanal

Plataforma web de comercio electrónico y gestión de pedidos para repostería artesanal y productos personalizados.

---

## 📁 Estructura del Proyecto

El repositorio cuenta con una arquitectura Full Stack organizada, limpia y desacoplada:

```
app-mama/
├── backend/                  # API REST con Node.js, Express 5 y Mongoose 9
│   ├── models/
│   │   └── Product.js        # Esquema validado de productos en MongoDB Atlas
│   ├── .env.example          # Plantilla de variables de entorno del servidor
│   ├── package.json          # Dependencias y scripts de backend
│   ├── server.js             # Servidor Express y endpoints CRUD completos
│   └── test-db.js            # Script para verificar conexión a MongoDB Atlas
│
├── frontend/                 # Single Page Application con React 19 y Vite 8
│   ├── public/
│   │   └── Logo.png          # Logotipo e isotipo de la marca
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.jsx      # Catálogo, configuradores interactivos y checkout WhatsApp
│   │   │   └── Admin.jsx     # Panel de administración para gestión de productos
│   │   ├── data/
│   │   │   └── mockData.js   # Catálogo base y opciones de personalización
│   │   ├── utils/
│   │   │   └── formatters.js # Funciones de formateo (moneda ARS, fechas)
│   │   ├── App.jsx           # Ruteo, persistencia en localStorage y modo oscuro
│   │   ├── App.css           # Sistema de diseño, temas (light/dark) y responsive
│   │   ├── index.css         # Reset base y tipografía
│   │   └── main.jsx          # Punto de entrada de React con StrictMode
│   ├── .env.example          # Variables de entorno para Vite (API y WhatsApp)
│   └── package.json          # Dependencias y scripts de frontend
│
├── legacy_prototype/         # Archivo del prototipo vanilla previo (resguardado)
├── .gitignore                # Reglas globales de exclusión para Git y secretos
├── package.json              # Scripts raíz para administración del workspace
└── README.md                 # Documentación técnica general
```

---

## 🚀 Puesta en Marcha en Desarrollo

### 1. Instalación de Dependencias
Podés instalar las dependencias de ambos proyectos ejecutando desde la raíz:

```bash
npm run install:all
```

O de forma individual:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

---

### 2. Variables de Entorno

#### Backend (`backend/.env`)
Creá el archivo `backend/.env` copiando `backend/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster0.bwgpdou.mongodb.net/hechobygaby?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend (`frontend/.env`)
Creá el archivo `frontend/.env` copiando `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_PHONE=5491112345678
```
> **Nota:** Reemplazá `VITE_WHATSAPP_PHONE` con el número de teléfono real del comercio (incluyendo código de país sin el signo +).

---

### 3. Iniciar Servidores de Desarrollo

Abrí dos terminales:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Servidor escuchando en http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Aplicación web disponible en http://localhost:5173
```

---

## 🛠️ Endpoints de la API Backend

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor y conexión con MongoDB Atlas |
| `GET` | `/api/products` | Lista todos los productos (permite filtro `?categoria=...`) |
| `GET` | `/api/products/:id` | Obtiene el detalle de un producto por su ID |
| `POST` | `/api/products` | Crea un nuevo producto validado en la base de datos |
| `PATCH` | `/api/products/:id` | Modifica precio, descripción o disponibilidad |
| `DELETE` | `/api/products/:id` | Elimina un producto de la base de datos |

---

## 🎨 Características Implementadas

- **Configurador de Tortas a Medida:** Estilos (Drip, Buttercream, Naked), tamaños en porciones, bizcochuelos y selección de hasta 3 rellenos con cálculo dinámico de precio.
- **Configurador de Tartas Clásicas:** Selección de sabores tradicionales, tamaños y cremas base condicionales.
- **Armá tu Desayuno / Stock:** Productos frescos sincronizados dinámicamente con MongoDB Atlas y filtrado por categorías.
- **Carrito Persistente:** Los pedidos se guardan en el `localStorage` del navegador, evitando pérdidas accidentales al recargar la página.
- **Checkout directo a WhatsApp:** Generación automática del mensaje detallado con los datos de entrega y el total cotizado.
- **Panel Administrativo (`/admin`):** Alta de productos con categoría, pausa/activación de disponibilidad y eliminación directa en MongoDB Atlas.
- **Modo Oscuro / Claro:** Tema persistente en `localStorage` con adaptación de paleta de colores.
- **Diseño Responsive:** Adaptado a pantallas móviles, tablets y computadoras de escritorio.
