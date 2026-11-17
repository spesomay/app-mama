import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './components/Home.jsx';
import Admin from './components/Admin.jsx';
import './App.css';

function HeaderActions({ cart, setActiveTab, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleGoToCart = () => {
    setActiveTab('resumen');
    navigate('/');
  };

  return (
    <div className="acciones-encabezado">
      <Link to="/admin" className="boton-admin-link" title="Panel de Administración">
        ⚙️ Admin
      </Link>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="boton-icono"
        title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        type="button"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <button onClick={handleGoToCart} className="boton-pedido" type="button">
        <span>🛒 Mi Pedido</span>
        <span className="contador-pedido">{cartCount}</span>
      </button>
    </div>
  );
}

export default function App() {
  // Inicialización persistente de Modo Oscuro
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hechoByGaby_theme') === 'dark';
  });

  const [activeTab, setActiveTab] = useState('custom');

  // Inicialización persistente del Carrito
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('hechoByGaby_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar carrito ante cambios
  useEffect(() => {
    localStorage.setItem('hechoByGaby_cart', JSON.stringify(cart));
  }, [cart]);

  // Aplicar tema en el DOM y persistir
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('hechoByGaby_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('hechoByGaby_theme', 'light');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <div>
        <header className="encabezado-principal">
          <div className="contenedor contenido-encabezado">
            <Link to="/" onClick={() => setActiveTab('custom')} className="logotipo">
              <div className="logo-badge">
                <img
                  src="/Logo.png"
                  alt="Logo HechoByGaby"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerText = '🍰';
                  }}
                />
              </div>
              <div>
                <h1 className="titulo-empresa">HechoByGaby</h1>
                <span className="subtitulo-empresa">Pastelería Artesanal</span>
              </div>
            </Link>

            <HeaderActions
              cart={cart}
              setActiveTab={setActiveTab}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </div>
        </header>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  cart={cart}
                  setCart={setCart}
                />
              }
            />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
