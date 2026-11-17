import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Extraemos la URL base del servidor (quitando '/api' si está presente)
export const SERVER_URL = API_BASE.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE,
});

/**
 * Resuelve la URL completa de una imagen (ya sea una ruta local '/uploads/...' o una URL externa)
 */
export function getProductImageUrl(imagePath) {
  if (!imagePath) return '';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }
  // Si es una ruta relativa local
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${SERVER_URL}${cleanPath}`;
}

/**
 * Obtener todos los productos con filtros opcionales (categoria, search, disponible)
 */
export async function getProducts(params = {}) {
  const response = await api.get('/products', { params });
  return response.data;
}

/**
 * Obtener un producto por ID
 */
export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

/**
 * Crear un nuevo producto (acepta FormData o JSON)
 */
export async function createProduct(productData) {
  const isFormData = productData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/products', productData, config);
  return response.data;
}

/**
 * Actualizar un producto existente por ID
 */
export async function updateProduct(id, productData) {
  const isFormData = productData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.put(`/products/${id}`, productData, config);
  return response.data;
}

/**
 * Eliminar un producto por ID
 */
export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}
