import { useState } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Gaby2026';

export default function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const inputClean = password.trim();

    if (!inputClean) {
      setError('Por favor, ingresá la contraseña de acceso.');
      return;
    }

    if (inputClean === DEFAULT_ADMIN_PASSWORD) {
      // Guardar sesión en sessionStorage para que expire al cerrar la pestaña
      sessionStorage.setItem('hechobygaby_admin_session', 'authenticated');
      onLoginSuccess();
    } else {
      setAttempts((prev) => prev + 1);
      setError('Contraseña incorrecta. Verificá los caracteres e intentá nuevamente.');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-contenedor">
      <div className="admin-login-tarjeta">
        <div className="admin-login-icono">🔐</div>

        <h2 className="admin-login-titulo">Acceso Administrativo</h2>
        <p className="admin-login-subtitulo">
          Ingresá la clave de seguridad para gestionar productos y galería de HechoByGaby.
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="campo-formulario">
            <label htmlFor="admin-pass" className="label-formulario">
              Contraseña de Administración
            </label>
            <div className="admin-input-grupo">
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ingresá tu clave secreta..."
                className="input-formulario"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-toggle-visibilidad"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label="Alternar visibilidad de contraseña"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-btn-ingresar">
            🔓 Ingresar al Panel Privado
          </button>
        </form>

        <div className="admin-login-pie">
          <Link to="/" className="admin-enlace-volver">
            ← Volver a la Tienda Pública
          </Link>
          {attempts >= 3 && (
            <p className="admin-pista-seguridad">
              Tip: Podés configurar tu clave en el archivo .env con <code>VITE_ADMIN_PASSWORD</code>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
