// =============================================================================
// CONTROLADOR DE PROPIEDADES - Module 3: RealEstate Hub API
// =============================================================================
// Los controladores contienen la lógica de negocio de los endpoints.
//
// ## Patrón Controller + Repository
// Separamos responsabilidades:
// - Controller: Maneja HTTP (req/res), validación, respuestas
// - Repository: Acceso a datos (Prisma), queries, transformaciones
//
// Esto facilita:
// - Testing (mock del repositorio)
// - Cambiar base de datos sin modificar controladores
// - Mantener controladores enfocados en HTTP
//
// ## Comparación con Android (MVVM)
// Android:
//   Controller ≈ ViewModel (maneja lógica de UI)
//   Repository = Repository (acceso a datos)
//
// Express:
//   Controller (maneja HTTP y lógica de negocio)
//   Repository (abstrae Prisma/base de datos)
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
 
  // Deben ser strings numéricos (no decimales, no texto)
  const pageStr = String(rawPage);
  const limitStr = String(rawLimit);
 
  if (!/^\d+$/.test(pageStr) || !/^\d+$/.test(limitStr)) {
    return null;
  }
 
  const page = parseInt(pageStr, 10);
  const limit = parseInt(limitStr, 10);
 
  // Rechazar valores negativos, cero o no numéricos
  if (page <= 0 || limit <= 0) {
    return null;
  }
 
  // Limitar el máximo de items por página para proteger el servidor
  if (limit > 100) {
    return null;
  }
 
  return { page, limit };
}
 
// =============================================================================
// GET /api/properties - Listar propiedades con filtros + paginación
// =============================================================================
// Reemplaza: localStorage.getItem('properties')
//
// Query params de paginación:
// - page:  Número de página (default: 1)
// - limit: Items por página (default: 10, máximo: 100)
//
// Respuesta:
// {
//   success: true,
//   data: [...],
//   meta: { total, page, limit, pages }
// }
// =============================================================================
 
export async function getAllProperties(req: Request, res: Response): Promise<void> {
  try {
    // --- Validar parámetros de paginación ---
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
 
    // --- Extraer filtros de los query params ---
    const filters: PropertyFilters = {
      search: req.query.search as string | undefined,
      propertyType: req.query.propertyType as PropertyFilters['propertyType'],
      operationType: req.query.operationType as PropertyFilters['operationType'],
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      minBedrooms: req.query.minBedrooms ? Number(req.query.minBedrooms) : undefined,
      city: req.query.city as string | undefined,
    };
 
    // --- Obtener total de registros (con filtros aplicados) ---
    const total = await propertyRepository.count(filters);
 
    // --- Calcular metadatos de paginación ---
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
 
    // --- Página fuera de rango → array vacío (no error) ---
    if (total > 0 && page > pages) {
      res.json({
        success: true,
        data: [],
        meta: { total, page, limit, pages },
      });
      return;
    }
 
    // --- Obtener registros paginados ---
    const properties = await propertyRepository.findAll(filters, { limit, offset });
 
    res.json({
      success: true,
      data: properties,
      meta: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
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
        error: {
          message: 'Propiedad no encontrada',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
 
    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
 
// =============================================================================
// POST /api/properties - Crear una nueva propiedad
// =============================================================================
// Reemplaza: localStorage.setItem('properties', ...)
// =============================================================================
 
export async function createProperty(req: Request, res: Response): Promise<void> {
  try {
    // Validamos el body con Zod
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
 
    // Delegamos la creación al repositorio
    const property = await propertyRepository.create(validationResult.data);
 
    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
 
// =============================================================================
// PUT /api/properties/:id - Actualizar una propiedad
// =============================================================================
 
export async function updateProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
 
    // Validamos el body
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
 
    // Delegamos la actualización al repositorio
    const property = await propertyRepository.update(id, validationResult.data);
 
    if (!property) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Propiedad no encontrada',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
 
    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
 
// =============================================================================
// DELETE /api/properties/:id - Eliminar una propiedad
// =============================================================================
 
export async function deleteProperty(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
 
    // Delegamos la eliminación al repositorio
    const deleted = await propertyRepository.delete(id);
 
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: {
          message: 'Propiedad no encontrada',
          code: 'NOT_FOUND',
        },
      });
      return;
    }
 
    res.json({
      success: true,
      data: { message: 'Propiedad eliminada correctamente' },
    });
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
 