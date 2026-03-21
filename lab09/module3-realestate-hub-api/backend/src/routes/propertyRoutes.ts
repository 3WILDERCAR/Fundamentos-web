// =============================================================================
// RUTAS DE PROPIEDADES - Module 3: RealEstate Hub API
// =============================================================================
// Define las rutas (endpoints) de la API de propiedades.
//
// ## Diseño RESTful
// - GET /api/properties         - Listar todas (con paginación)
// - GET /api/properties/stats   - Estadísticas globales   ← NUEVO
// - GET /api/properties/:id     - Obtener una
// - POST /api/properties        - Crear nueva
// - PUT /api/properties/:id     - Actualizar
// - DELETE /api/properties/:id  - Eliminar
//
// ## ORDEN IMPORTA
// /stats debe ir registrada ANTES de /:id.
// Si /:id va primero, Express interpretaría /stats como id="stats"
// y nunca llegaría al handler correcto.
// =============================================================================
 
import { Router } from 'express';
import {
  getAllProperties,
  getPropertyStats,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
 
const router = Router();
 
// =============================================================================
// RUTAS
// =============================================================================
 
/**
 * GET /api/properties
 * Lista propiedades con filtros opcionales y paginación.
 *
 * Query params — Paginación:
 * - page:        Número de página, empieza en 1 (default: 1)
 * - limit:       Items por página, máximo 100 (default: 10)
 *
 * Query params — Filtros:
 * - search, propertyType, operationType, minPrice, maxPrice, minBedrooms, city
 */
router.get('/', (req, res) => {
  void getAllProperties(req, res);
});
 
/**
 * GET /api/properties/stats
 * Devuelve estadísticas globales de propiedades.
 *
 * Respuesta:
 * {
 *   success: true,
 *   data: {
 *     total: number,
 *     priceRange: { min: number, max: number },
 *     byType: {
 *       [tipo]: { count: number, averagePrice: number }
 *     }
 *   }
 * }
 *
 * NOTA: debe ir antes de /:id para que Express no confunda "stats" con un ID.
 */
router.get('/stats', (req, res) => {
  void getPropertyStats(req, res);
});
 
/**
 * GET /api/properties/:id
 * Obtiene una propiedad específica por su ID.
 */
router.get('/:id', (req, res) => {
  void getPropertyById(req, res);
});
 
/**
 * POST /api/properties
 * Crea una nueva propiedad.
 */
router.post('/', (req, res) => {
  void createProperty(req, res);
});
 
/**
 * PUT /api/properties/:id
 * Actualiza una propiedad existente.
 */
router.put('/:id', (req, res) => {
  void updateProperty(req, res);
});
 
/**
 * DELETE /api/properties/:id
 * Elimina una propiedad.
 */
router.delete('/:id', (req, res) => {
  void deleteProperty(req, res);
});
 
export default router;