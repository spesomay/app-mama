import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://app-mama-backend-d135.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
});

/**
 * Obtener todos los ítems de desayuno (con filtros opcionales: subcategoria, disponible)
 */
export async function getBreakfastItems(params = {}) {
  const response = await api.get('/breakfast-items', { params });
  return response.data;
}

/**
 * Obtener un ítem de desayuno por ID
 */
export async function getBreakfastItemById(id) {
  const response = await api.get(`/breakfast-items/${id}`);
  return response.data;
}

/**
 * Crear un nuevo ítem de desayuno (FormData con foto o JSON)
 */
export async function createBreakfastItem(itemData) {
  const isFormData = itemData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/breakfast-items', itemData, config);
  return response.data;
}

/**
 * Actualizar un ítem de desayuno por ID
 */
export async function updateBreakfastItem(id, itemData) {
  const isFormData = itemData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.put(`/breakfast-items/${id}`, itemData, config);
  return response.data;
}

/**
 * Eliminar un ítem de desayuno por ID
 */
export async function deleteBreakfastItem(id) {
  const response = await api.delete(`/breakfast-items/${id}`);
  return response.data;
}
