// =============================================================================
// REPOSITORIO DE PROPIEDADES - Module 3: RealEstate Hub API
// =============================================================================
// El repositorio abstrae el acceso a la base de datos.
//
// ## Patrón Repository
// Separamos la lógica de persistencia del controlador para:
// - Facilitar el testing (mock del repositorio)
// - Cambiar la base de datos sin modificar controladores
// - Centralizar queries y transformaciones
//
// ## Comparación con Android (Room)
// Android:
//   @Dao
//   interface PropertyDao {
//       @Query("SELECT * FROM properties") fun getAll(): Flow<List<Property>>
//       @Insert suspend fun insert(property: Property)
//   }
//
// Express + Prisma:
//   class PropertyRepository {
//       async findAll(filters, pagination): Promise<Property[]>
//       async count(filters): Promise<number>
//       async getStats(): Promise<PropertyStats>
//       async create(data): Promise<Property>
//   }
// =============================================================================
 
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import type { Property, PropertyFilters, CreatePropertyInput, UpdatePropertyInput } from '../types/property.js';
 
// =============================================================================
// CLIENTE PRISMA (Singleton con Adapter para Prisma 7)
// =============================================================================
 
const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });
 
// =============================================================================
// TIPOS INTERNOS
// =============================================================================
 
interface PrismaProperty {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  operationType: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string;
  images: string;
  createdAt: Date;
  updatedAt: Date;
}
 
interface PaginationOptions {
  limit: number;
  offset: number;
}
 
// Estadísticas por tipo de propiedad
interface PropertyTypeStats {
  count: number;
  averagePrice: number;
}
 
// Respuesta completa del endpoint de estadísticas
export interface PropertyStats {
  total: number;
  priceRange: {
    min: number;
    max: number;
  };
  byType: Record<string, PropertyTypeStats>;
}
 
// =============================================================================
// TRANSFORMADORES
// =============================================================================
 
/**
 * Transforma un registro de Prisma al tipo Property de la API.
 * Prisma almacena arrays como JSON strings en SQLite → los parseamos.
 */
function toProperty(dbProperty: PrismaProperty): Property {
  return {
    id: dbProperty.id,
    title: dbProperty.title,
    description: dbProperty.description,
    propertyType: dbProperty.propertyType as Property['propertyType'],
    operationType: dbProperty.operationType as Property['operationType'],
    price: dbProperty.price,
    address: dbProperty.address,
    city: dbProperty.city,
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    area: dbProperty.area,
    amenities: JSON.parse(dbProperty.amenities) as Property['amenities'],
    images: JSON.parse(dbProperty.images) as Property['images'],
    createdAt: dbProperty.createdAt.toISOString(),
    updatedAt: dbProperty.updatedAt.toISOString(),
  };
}
 
/**
 * Prepara datos para Prisma (arrays a JSON strings).
 */
function toPrismaData(data: CreatePropertyInput | UpdatePropertyInput): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
 
  if ('amenities' in data && data.amenities) {
    result.amenities = JSON.stringify(data.amenities);
  }
  if ('images' in data && data.images) {
    result.images = JSON.stringify(data.images);
  }
 
  return result;
}
 
// =============================================================================
// REPOSITORIO
// =============================================================================
 
export const propertyRepository = {
  /**
   * Busca propiedades con filtros opcionales y paginación.
   */
  async findAll(filters?: PropertyFilters, pagination?: PaginationOptions): Promise<Property[]> {
    const where = buildWhereClause(filters);
 
    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination?.limit,
      skip: pagination?.offset,
    });
 
    return properties.map(toProperty);
  },
 
  /**
   * Cuenta el total de propiedades que coinciden con los filtros.
   */
  async count(filters?: PropertyFilters): Promise<number> {
    const where = buildWhereClause(filters);
    return prisma.property.count({ where });
  },
 
  /**
   * Calcula estadísticas globales de propiedades.
   *
   * Usa dos queries de Prisma:
   * - groupBy:    agrupa por propertyType → count + avg por tipo
   * - aggregate:  min, max y total global
   *
   * Si la BD está vacía devuelve zeros, nunca lanza error.
   *
   * Ejemplo de respuesta:
   * {
   *   total: 5,
   *   priceRange: { min: 650, max: 850000 },
   *   byType: {
   *     casa:        { count: 2, averagePrice: 550000 },
   *     apartamento: { count: 2, averagePrice: 925 },
   *     oficina:     { count: 1, averagePrice: 3500 },
   *   }
   * }
   */
  async getStats(): Promise<PropertyStats> {
    // Query 1: agrupar por tipo → count + precio promedio por tipo
    const grouped = await prisma.property.groupBy({
      by: ['propertyType'],
      _count: { id: true },
      _avg: { price: true },
    });
 
    // Query 2: totales globales → count total + precio min/max
    const aggregate = await prisma.property.aggregate({
      _count: { id: true },
      _min: { price: true },
      _max: { price: true },
    });
 
    // Transformar el array de groupBy a un objeto indexado por tipo
    const byType: Record<string, PropertyTypeStats> = {};
    for (const group of grouped) {
      byType[group.propertyType] = {
        count: group._count.id,
        averagePrice: Math.round(group._avg.price ?? 0),
      };
    }
 
    return {
      total: aggregate._count.id,
      priceRange: {
        min: aggregate._min.price ?? 0,
        max: aggregate._max.price ?? 0,
      },
      byType,
    };
  },
 
  /**
   * Busca una propiedad por ID.
   */
  async findById(id: string): Promise<Property | null> {
    const property = await prisma.property.findUnique({ where: { id } });
    return property ? toProperty(property) : null;
  },
 
  /**
   * Crea una nueva propiedad.
   */
  async create(data: CreatePropertyInput): Promise<Property> {
    const prismaData = toPrismaData(data);
 
    const property = await prisma.property.create({
      data: prismaData as Parameters<typeof prisma.property.create>[0]['data'],
    });
 
    return toProperty(property);
  },
 
  /**
   * Actualiza una propiedad existente.
   */
  async update(id: string, data: UpdatePropertyInput): Promise<Property | null> {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return null;
 
    const prismaData = toPrismaData(data);
 
    const property = await prisma.property.update({
      where: { id },
      data: prismaData,
    });
 
    return toProperty(property);
  },
 
  /**
   * Elimina una propiedad.
   */
  async delete(id: string): Promise<boolean> {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return false;
 
    await prisma.property.delete({ where: { id } });
    return true;
  },
 
  /**
   * Verifica si una propiedad existe.
   */
  async exists(id: string): Promise<boolean> {
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true },
    });
    return property !== null;
  },
};
 
// =============================================================================
// HELPERS
// =============================================================================
 
/**
 * Construye la cláusula WHERE de Prisma a partir de los filtros.
 */
function buildWhereClause(filters?: PropertyFilters): Record<string, unknown> {
  if (!filters) return {};
 
  const where: Record<string, unknown> = {};
 
  if (filters.propertyType) {
    where.propertyType = filters.propertyType;
  }
 
  if (filters.operationType) {
    where.operationType = filters.operationType;
  }
 
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      (where.price as Record<string, number>).gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (where.price as Record<string, number>).lte = filters.maxPrice;
    }
  }
 
  if (filters.minBedrooms !== undefined) {
    where.bedrooms = { gte: filters.minBedrooms };
  }
 
  if (filters.city) {
    where.city = { contains: filters.city };
  }
 
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { description: { contains: filters.search } },
      { address: { contains: filters.search } },
      { city: { contains: filters.search } },
    ];
  }
 
  return where;
}
 
// Export por defecto para compatibilidad
export default propertyRepository;