import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLogin from './admin/AdminLogin';
import AdminProductForm from './admin/AdminProductForm';
import AdminProductList from './admin/AdminProductList';
import AdminGalleryManager from './admin/AdminGalleryManager';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/productService';

export default function Admin() {
  // Estado de autenticación protegido mediante sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('hechobygaby_admin_session') === 'authenticated';
  });

  const [activeAdminSection, setActiveAdminSection] = useState('products'); // 'products' o 'gallery'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Mensajes de retroalimentación
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback({ type: '', text: '' });
    }, 5000);
  };

  // Cargar lista de productos solo si está autenticado
  const loadProducts = useCallback(() => {
    if (!isAuthenticated) return;
    getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar productos:', err);
        setLoading(false);
        showFeedback(
          'error',
          'No se pudo conectar con el servidor backend. Verificá tu conexión o que el backend esté activo.'
        );
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated, loadProducts]);

  // Cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem('hechobygaby_admin_session');
    setIsAuthenticated(false);
    setEditingProduct(null);
  };

  // Manejador para Crear o Actualizar Producto
  const handleSaveProduct = async (formData, resetForm) => {
    setIsSubmitting(true);
    setFeedback({ type: '', text: '' });

    try {
      if (editingProduct) {
        // Modo Edición (PUT)
        const updated = await updateProduct(editingProduct._id, formData);
        showFeedback('success', `¡Producto "${updated.nombre}" actualizado con éxito en MongoDB!`);
        setEditingProduct(null);
      } else {
        // Modo Creación (POST)
        const created = await createProduct(formData);
        showFeedback('success', `¡Producto "${created.nombre}" guardado con éxito en MongoDB Atlas!`);
      }

      resetForm();
      loadProducts();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Ocurrió un error inesperado al guardar el producto.';
      showFeedback('error', `Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seleccionar producto para editar
  const handleEditSelect = (product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  // Eliminar producto
  const handleDeleteProduct = async (id, nombre) => {
    const confirmacion = window.confirm(
      `¿Estás segura de que deseás eliminar permanentemente "${nombre}" de la base de datos?`
    );
    if (!confirmacion) return;

    try {
      await deleteProduct(id);
      showFeedback('success', `El producto "${nombre}" ha sido eliminado.`);
      if (editingProduct && editingProduct._id === id) {
        setEditingProduct(null);
      }
      loadProducts();
    } catch (err) {
      console.error('Error al eliminar:', err);
      const errorMsg = err.response?.data?.error || err.message;
      showFeedback('error', `Error al eliminar el producto: ${errorMsg}`);
    }
  };

  // Pausar o activar producto
  const handleToggleStatus = async (product) => {
    try {
      const formData = new FormData();
      formData.append('disponible', !product.disponible);
      await updateProduct(product._id, formData);
      loadProducts();
      showFeedback(
        'success',
        `Producto "${product.nombre}" ${!product.disponible ? 'activado' : 'pausado'} correctamente.`
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      showFeedback('error', 'No se pudo modificar la disponibilidad del producto.');
    }
  };

  // ----------------------------------------------------
  // SI NO ESTÁ AUTENTICADO: MOSTRAR BARRERA DE SEGURIDAD
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // ----------------------------------------------------
  // SI ESTÁ AUTENTICADO: MOSTRAR PANEL COMPLETO
  // ----------------------------------------------------
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      {/* ENCABEZADO DEL PANEL */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: 'var(--texto-oscuro)', fontSize: '1.6rem' }}>
              ⚙️ Panel de Administración
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '10px',
                background: '#dcfce7',
                color: '#15803d',
                fontWeight: 600
              }}
            >
              Sesión Segura
            </span>
          </div>
          <p style={{ color: 'var(--texto-gris)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Gestión completa de Catálogo de Productos y Galería de Fotos en MongoDB Atlas
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="boton-admin-link" title="Ver la tienda visible para clientes">
            🏪 Ver Tienda
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="boton-admin-logout"
            title="Cerrar la sesión administrativa"
          >
            🔒 Salir
          </button>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN DENTRO DEL PANEL ADMIN */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--rosa-borde)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveAdminSection('products')}
          className={`pestana ${activeAdminSection === 'products' ? 'activa' : ''}`}
          style={{ fontSize: '1rem', padding: '0.6rem 1.25rem' }}
        >
          📦 Catálogo de Productos
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminSection('gallery')}
          className={`pestana ${activeAdminSection === 'gallery' ? 'activa' : ''}`}
          style={{ fontSize: '1rem', padding: '0.6rem 1.25rem' }}
        >
          🖼️ Gestión de Galería de Fotos
        </button>
      </div>

      {/* SECCIÓN 1: PRODUCTOS */}
      {activeAdminSection === 'products' && (
        <div>
          {/* ALERTAS DE FEEDBACK */}
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

          {/* FORMULARIO DE CREACIÓN / EDICIÓN */}
          <AdminProductForm
            key={editingProduct?._id || 'new'}
            editingProduct={editingProduct}
            onSave={handleSaveProduct}
            onCancelEdit={handleCancelEdit}
            isSubmitting={isSubmitting}
          />

          {/* LISTA PREVIA DE PRODUCTOS CARGADOS */}
          <AdminProductList
            products={products}
            loading={loading}
            onEdit={handleEditSelect}
            onDelete={handleDeleteProduct}
            onToggleStatus={handleToggleStatus}
            onRefresh={loadProducts}
          />
        </div>
      )}

      {/* SECCIÓN 2: GESTIÓN DE GALERÍA DE FOTOS */}
      {activeAdminSection === 'gallery' && (
        <AdminGalleryManager />
      )}
    </div>
  );
}
