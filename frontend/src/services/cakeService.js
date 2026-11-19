import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://app-mama-backend-d135.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
});

/**
 * Obtener las opciones configurables para el constructor de tortas a medida
 * (Devuelve { tamanos, estilos, bizcochuelos, rellenos, todas } o array si se filtra por ?tipo=...)
 */
export async function getCakeOptions(params = {}) {
  const response = await api.get('/cake-options', { params });
  return response.data;
}

/**
 * Crear una nueva opción de torta (tamaño, estilo, bizcochuelo o relleno)
 */
export async function createCakeOption(optionData) {
  const response = await api.post('/cake-options', optionData);
  return response.data;
}

/**
 * Actualizar una opción existente por ID
 */
export async function updateCakeOption(id, optionData) {
  const response = await api.put(`/cake-options/${id}`, optionData);
  return response.data;
}

/**
 * Eliminar una opción por ID
 */
export async function deleteCakeOption(id) {
  const response = await api.delete(`/cake-options/${id}`);
  return response.data;
}
