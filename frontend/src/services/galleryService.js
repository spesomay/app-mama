import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://app-mama-backend-d135.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
});

/**
 * Obtener fotos de la galería (con filtro opcional por categoría)
 */
export async function getGalleryItems(params = {}) {
  const response = await api.get('/gallery', { params });
  return response.data;
}

/**
 * Subir una nueva foto a la galería (acepta FormData con archivo o JSON con URL)
 */
export async function createGalleryItem(galleryData) {
  const isFormData = galleryData instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/gallery', galleryData, config);
  return response.data;
}

/**
 * Eliminar una foto de la galería por ID
 */
export async function deleteGalleryItem(id) {
  const response = await api.delete(`/gallery/${id}`);
  return response.data;
}
