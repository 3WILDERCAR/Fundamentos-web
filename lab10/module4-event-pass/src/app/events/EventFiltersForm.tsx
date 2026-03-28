// =============================================================================
// COMPONENTE EVENT FILTERS FORM - Module 4: Event Pass
// =============================================================================
// Formulario de filtros con estado en URL.
//
// ## Client Component
// Usa useRouter + useSearchParams para actualizar la URL sin recarga completa.
//
// ## URL-based State
// Los filtros viven en la URL (?category=music&status=active), lo que permite:
// - Compartir/bookmarking de filtros activos
// - Persistencia al refrescar
// - Navegación con historial del browser
//
// ## Progressive Enhancement
// El formulario usa method="GET" como fallback si JS no está disponible.
// =============================================================================

'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  EVENT_CATEGORIES,
  CATEGORY_LABELS,
  EVENT_STATUSES,
  STATUS_LABELS,
  type EventCategory,
  type EventStatus,
} from '@/types/event';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface EventFiltersFormProps {
  currentFilters: {
    search?: string;
    category?: EventCategory;
    status?: EventStatus;
    priceMax?: number;
  };
}

/** Construye un objeto URLSearchParams limpio a partir de los filtros activos */
function buildParams(filters: {
  search?: string;
  category?: string;
  status?: string;
  priceMax?: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.priceMax) params.set('priceMax', filters.priceMax);
  return params;
}

/** Etiqueta legible para el precio máximo */
function priceLabel(value?: number): string {
  if (value === undefined) return '';
  if (value === 0) return 'Gratis';
  return `Hasta $${value}`;
}

/**
 * Formulario de filtros de eventos (Client Component).
 * Actualiza la URL sin recarga completa usando useRouter.push.
 */
export function EventFiltersForm({ currentFilters }: EventFiltersFormProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado local para el input de búsqueda (se debouncea antes de actualizar URL)
  const [searchTerm, setSearchTerm] = useState(currentFilters.search ?? '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Ref para evitar push en el primer render
  const isFirstRender = useRef(true);

  const hasFilters =
    currentFilters.search ||
    currentFilters.category ||
    currentFilters.priceMax !== undefined ||
    currentFilters.status;

  /** Navega a /events con los nuevos parámetros, manteniendo los existentes */
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const current = new URLSearchParams(searchParams.toString());
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
      router.push(`/events?${current.toString()}`);
    },
    [router, searchParams],
  );

  /** Quita un filtro específico de la URL */
  const removeFilter = useCallback(
    (key: string) => {
      const current = new URLSearchParams(searchParams.toString());
      current.delete(key);
      router.push(`/events?${current.toString()}`);
    },
    [router, searchParams],
  );

  // Auto-push cuando cambia el debounced search
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateFilter('search', debouncedSearch);
  }, [debouncedSearch, updateFilter]);

  // Chips de filtros activos
  const activeChips: { key: string; label: string }[] = [
    ...(currentFilters.search ? [{ key: 'search', label: `"${currentFilters.search}"` }] : []),
    ...(currentFilters.category
      ? [{ key: 'category', label: CATEGORY_LABELS[currentFilters.category] }]
      : []),
    ...(currentFilters.status
      ? [{ key: 'status', label: STATUS_LABELS[currentFilters.status] }]
      : []),
    ...(currentFilters.priceMax !== undefined
      ? [{ key: 'priceMax', label: priceLabel(currentFilters.priceMax) }]
      : []),
  ];

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {/* Header row */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
      </div>

      {/* Fallback form (funciona sin JS) */}
      <form method="GET" action="/events" className="space-y-3">
        {/* Fila de búsqueda */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </div>

        {/* Selectores de filtro */}
        <div className="flex flex-wrap gap-3">
          {/* Categoría */}
          <select
            name="category"
            value={currentFilters.category ?? ''}
            onChange={(e) => updateFilter('category', e.target.value)}
            className={[
              'h-10 w-[180px] rounded-md border px-3 py-2 text-sm ring-offset-background',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'bg-background transition-colors',
              currentFilters.category
                ? 'border-primary bg-primary/5 font-medium text-primary'
                : 'border-input',
            ].join(' ')}
          >
            <option value="">Todas las categorías</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>

          {/* Estado */}
          <select
            name="status"
            value={currentFilters.status ?? ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            className={[
              'h-10 w-[180px] rounded-md border px-3 py-2 text-sm ring-offset-background',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'bg-background transition-colors',
              currentFilters.status
                ? 'border-primary bg-primary/5 font-medium text-primary'
                : 'border-input',
            ].join(' ')}
          >
            <option value="">Todos los estados</option>
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          {/* Precio máximo */}
          <select
            name="priceMax"
            value={currentFilters.priceMax?.toString() ?? ''}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
            className={[
              'h-10 w-[180px] rounded-md border px-3 py-2 text-sm ring-offset-background',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'bg-background transition-colors',
              currentFilters.priceMax !== undefined
                ? 'border-primary bg-primary/5 font-medium text-primary'
                : 'border-input',
            ].join(' ')}
          >
            <option value="">Cualquier precio</option>
            <option value="0">Gratis</option>
            <option value="25">Hasta $25</option>
            <option value="50">Hasta $50</option>
            <option value="100">Hasta $100</option>
            <option value="200">Hasta $200</option>
          </select>

          {/* Botón limpiar todo */}
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => router.push('/events')}
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </form>

      {/* Chips de filtros activos */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <span className="text-xs text-muted-foreground self-center">Activos:</span>
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => removeFilter(chip.key)}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}