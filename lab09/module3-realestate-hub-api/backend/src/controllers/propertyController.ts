// =============================================================================
// CONTROLADOR DE PROPIEDADES - Module 3: RealEstate Hub API
// =============================================================================
// Los controladores contienen la lógica de negocio de los endpoints.
//
// ## Patrón Controller + Repository
// Separamos responsabilidades:
// - Controller: Maneja HTTP (req/res), validación, respuestas
// - Repository: Acceso a datos (Prisma), queries, transformaciones
// =============================================================================
 
import type { Request, Response } from 'express';
import { createPropertySchema, updatePropertySchema, type PropertyFilters } from '../types/property.js';
import { propertyRepository } from '../repositories/propertyRepository.js';
 
// =============================================================================
// HELPERS DE PAGINACIÓN
// =============================================================================
 
interface PaginationParams {
  page: number;
  limit: number;
}
 
/**
 * Parsea y valida los query params de paginación.
 * Retorna null si algún valor es inválido.
 */
function parsePaginationParams(query: Request['query']): PaginationParams | null {
  const rawPage = query.page ?? '1';
  const rawLimit = query.limit ?? '10';
 
  const pageStr = String(rawPage);
  const limitStr = String(rawLimit);
 
  if (!/^\d+$/.test(pageStr) || !/^\d+$/.test(limitStr)) {
    return null;
  }
 
  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);
 
  if (page <= 0 || limit <= 0) {
    return null;
  }
 
  if (limit > 100) {
    return null;
  }
 
  return { page, limit };
}
 
// =============================================================================
// GET /api/properties - Listar propiedades con filtros + paginación
// =============================================================================
 
export async function getAllProperties(req: Request, res: Response): Promise<void> {
  try {
    const pagination = parsePaginationParams(req.query);
 
    if (!pagination) {
      res.status(400).json({
        success: false,
        error: {
          message:
            'Parámetros de paginación inválidos. ' +
            '"page" y "limit" deben ser enteros positivos. El límite máximo es 100.',
          code: 'INVALID_PAGINATION',
        },
      });
      return;
    }
 
    const { page, limit } = pagination;
 
    const filters: PropertyFilters = {
      search: req.query.search as string | undefined,
      propertyType: req.query.propertyType as PropertyFilters['propertyType'],
      operationType: req.query.operationType as PropertyFilters['operationType'],
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minBedrooms: req.query.minBedrooms ? Number(req.query.minBedrooms) : undefined,
      city: req.query.city as string | undefined,
    };
 
    const total = await propertyRepository.count(filters);
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
 
    if (total > 0 && page > pages) {
      res.json({
        success: true,
        data: [],
        meta: { total, page, limit, pages },
      });
      return;
    }
 
    const properties = await propertyRepository.findAll(filters, { limit, offset });
 
    res.json({
      success: true,
      data: properties,
      meta: { total, page, limit, pages },
    });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    });
  }
}
 
// =============================================================================
// GET /api/properties/stats - Estadísticas de propiedades
// =============================================================================
// Devuelve:
// {
//   success: true,
//   data: {
//     total: 5,
//     priceRange: { min: 650, max: 850000 },
//     byType: {
//       casa:        { count: 2, averagePrice: 550000 },
//       apartamento: { count: 2, averagePrice: 925 },
//       oficina:     { count: 1, averagePrice: 3500 },
//     }
//   }
// }
//
// IMPORTANTE: Esta ruta debe registrarse ANTES de /:id en propertyRoutes.ts
// para que Express no interprete "stats" como un ID.
// =============================================================================
 
export async function getPropertyStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await propertyRepository.getStats();
 
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    });
  }
}
 
// =============================================================================
// GET /api/properties/:id - Obtener una propiedad por ID
// =============================================================================
 
export async function getPropertyById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
 
    const property = await propertyRepository.findById(id);
 
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada', code: 'NOT_FOUND' },
      });
      return;
    }
 
    res.json({ success: true, data: property });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    });
  }
}
 
// =============================================================================
// POST /api/properties - Crear una nueva propiedad
// =============================================================================
 
export async function createProperty(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = createPropertySchema.safeParse(req.body);
 
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues,
        },
      });
      return;
    }
 
    const property = await propertyRepository.create(validationResult.data);
 
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    });
  }
}
 
// =============================================================================
// PUT /api/properties/:id - Actualizar una propiedad
// =============================================================================
 
export async function updateProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
 
    const validationResult = updatePropertySchema.safeParse(req.body);
 
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues,
        },
      });
      return;
    }
 
    const property = await propertyRepository.update(id, validationResult.data);
 
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada', code: 'NOT_FOUND' },
      });
      return;
    }
 
    res.json({ success: true, data: property });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    });
  }
}
 
// =============================================================================
// DELETE /api/properties/:id - Eliminar una propiedad
// =============================================================================
 
export async function deleteProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
 
    const deleted = await propertyRepository.delete(id);
 
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada', code: 'NOT_FOUND' },
      });
      return;
    }
 
    res.json({ success: true, data: { message: 'Propiedad eliminada correctamente' } });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    });
  }
}