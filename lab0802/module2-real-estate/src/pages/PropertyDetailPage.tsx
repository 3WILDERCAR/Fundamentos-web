// =============================================================================
// PÁGINA: DETALLE DE PROPIEDAD - Real Estate React
// =============================================================================

import type React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Tag,
  MessageCircle,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageGallery } from '@/components/ImageGallery'; // Importamos el nuevo componente

import { getPropertyById, deleteProperty } from '@/lib/storage';
import {
  PROPERTY_TYPE_LABELS,
  OPERATION_TYPE_LABELS,
  AMENITY_LABELS,
  type Amenity,
} from '@/types/property';
import { formatPrice, formatArea } from '@/lib/utils';

export function PropertyDetailPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Obtenemos la propiedad por ID
  const property = id ? getPropertyById(id) : undefined;

  // Si no existe la propiedad, mostramos error
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Propiedad no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          La propiedad que buscas no existe o ha sido eliminada de nuestra base de datos.
        </p>
        <Button asChild size="lg">
          <Link to="/">Volver al listado principal</Link>
        </Button>
      </div>
    );
  }

  /**
   * Maneja la eliminación de la propiedad.
   */
  const handleDelete = (): void => {
    if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta propiedad?')) {
      deleteProperty(property.id);
      navigate('/');
    }
  };

  // Preparamos el array de imágenes para la galería
  const displayImages = property.images.length > 0 
    ? property.images 
    : [`https://placehold.co/1200x600/e2e8f0/64748b?text=${encodeURIComponent(property.propertyType)}`];

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Navegación Superior */}
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" className="-ml-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al listado
          </Link>
        </Button>
        
        <div className="flex gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Ref ID: {property.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA PRINCIPAL (Izquierda) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN DE GALERÍA INTERACTIVA */}
          <section className="relative group">
            <ImageGallery images={displayImages} propertyTitle={property.title} />
            
            {/* Badge de Operación flotante */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <span className={`px-4 py-1.5 text-xs font-bold uppercase rounded-full shadow-lg ${
                property.operationType === 'venta' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-sky-500 text-white'
              }`}>
                {OPERATION_TYPE_LABELS[property.operationType]}
              </span>
            </div>
          </section>

          {/* DESCRIPCIÓN */}
          <Card className="border-none shadow-sm bg-card/50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                Descripción
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </CardContent>
          </Card>

          {/* AMENIDADES / CARACTERÍSTICAS EXTRA */}
          {property.amenities.length > 0 && (
            <Card className="border-none shadow-sm bg-card/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Amenidades y Servicios</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50 text-foreground/80"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-medium">
                        {AMENITY_LABELS[amenity as Amenity]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* COLUMNA LATERAL (Derecha - Información de compra y contacto) */}
        <div className="space-y-6">
          <Card className="sticky top-8 border-none shadow-xl ring-1 ring-black/5">
            <CardContent className="p-8">
              {/* Precio y Título */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-primary tracking-tight">
                    {formatPrice(property.price)}
                  </span>
                  {property.operationType === 'alquiler' && (
                    <span className="text-muted-foreground font-medium">/ mes</span>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  {PROPERTY_TYPE_LABELS[property.propertyType]}
                </p>
                <h1 className="text-2xl font-bold leading-tight mb-2">
                  {property.title}
                </h1>
              </div>

              {/* Ubicación */}
              <div className="flex items-start gap-3 text-muted-foreground mb-8 p-4 rounded-lg bg-muted/30">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-primary/70" />
                <div>
                  <p className="font-medium text-foreground">{property.address}</p>
                  <p className="text-sm">{property.city}</p>
                </div>
              </div>

              {/* Grid de especificaciones rápidas */}
              <div className="grid grid-cols-3 gap-2 py-6 border-y border-border/60 mb-8">
                {property.bedrooms > 0 && (
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto mb-2 text-primary/80" />
                    <p className="text-lg font-bold">{property.bedrooms}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Habit.</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto mb-2 text-primary/80" />
                    <p className="text-lg font-bold">{property.bathrooms}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Baños</p>
                  </div>
                )}
                <div className="text-center">
                  <Square className="h-6 w-6 mx-auto mb-2 text-primary/80" />
                  <p className="text-lg font-bold">{formatArea(property.area)}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Área</p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3 mb-8">
                <Button className="w-full h-12 text-md font-bold" size="lg">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contactar Agente
                </Button>
                <Button variant="outline" className="w-full h-12 text-md font-semibold" size="lg">
                  Agendar una visita
                </Button>
              </div>

              {/* Footer del Card: Fecha y Admin */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Publicado el {new Date(property.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                
                <Button
                  variant="link"
                  className="w-full text-destructive hover:text-destructive/80 text-xs p-0 h-auto"
                  onClick={handleDelete}
                >
                  Eliminar esta propiedad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}