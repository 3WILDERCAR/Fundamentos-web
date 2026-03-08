// Clave única para identificar nuestros favoritos en el almacenamiento del navegador
const STORAGE_KEY = 'country_explorer_favorites';

/**
 * Recupera la lista de países favoritos desde localStorage.
 * Retorna un array vacío si no hay datos guardados.
 */
export const getFavorites = (): string[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  try {
    // Intentamos parsear; si el dato está corrupto, devolvemos array vacío
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error al parsear favoritos:', error);
    return [];
  }
};

/**
 * Agrega o elimina un país de la lista de favoritos (Toggle).
 * @param countryCode Código CCA3 del país (ej: "ARG", "ESP")
 */
export const toggleFavorite = (countryCode: string): void => {
  // Usamos un Set para asegurar que no haya duplicados y facilitar la búsqueda
  const favoritesSet = new Set(getFavorites());

  if (favoritesSet.has(countryCode)) {
    favoritesSet.delete(countryCode);
  } else {
    favoritesSet.add(countryCode);
  }

  // Convertimos de nuevo a array para guardar como JSON
  const updatedFavorites = Array.from(favoritesSet);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavorites));
};

/**
 * Borra todos los favoritos de un solo golpe.
 */
export const clearAllFavorites = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Verifica si un país específico es favorito.
 */
export const isFavorite = (countryCode: string): boolean => {
  const favorites = getFavorites();
  return favorites.includes(countryCode);
};