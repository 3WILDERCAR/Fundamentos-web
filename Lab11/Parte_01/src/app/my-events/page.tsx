// =============================================================================
// PÁGINA MIS EVENTOS - Module 4: Event Pass
// =============================================================================
// Página protegida que muestra solo los eventos del usuario autenticado.
//
// ## Criterios implementados
// - Ruta protegida: redirige a /auth si no hay sesión
// - Filtro de usuario: solo muestra eventos donde organizerId === user.uid
// - Botón de edición: navega al formulario con datos precargados
// - Botón Eliminar: confirma y elimina eventos (via deleteEventAction)
// - Autorización: el servidor valida propiedad antes de eliminar
// - Estado vacío: mensaje "Aún no hay eventos" con CTA
// - Estado de carga: manejado por Suspense con esqueleto
// =============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Plus, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/EventCard';
import { getEventsByOrganizer } from '@/data/events';
import { adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

/**
 * Metadata de la página.
 */
export const metadata: Metadata = {
  title: 'Mis Eventos',
  description: 'Gestiona tus eventos creados.',
};

// =============================================================================
// SKELETON DE CARGA
// =============================================================================
// Se muestra mientras se obtienen los eventos del servidor.
// Imita la estructura de EventCard para evitar layout shifts.

function MyEventsSkeleton(): React.ReactElement {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl overflow-hidden border bg-muted">
          <div className="aspect-video bg-muted-foreground/10" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
            <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
            <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// ESTADO VACÍO
// =============================================================================
// Se muestra cuando el usuario no tiene eventos creados.
// Incluye un CTA para crear el primer evento.

function EmptyState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <CalendarX className="h-16 w-16 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Aún no hay eventos</h2>
        <p className="text-sm text-muted-foreground">
          Crea tu primer evento y empieza a compartirlo con tu comunidad.
        </p>
      </div>
      <Button asChild className="gap-2 mt-2">
        <Link href="/events/new">
          <Plus className="h-4 w-4" />
          Crear evento
        </Link>
      </Button>
    </div>
  );
}

// =============================================================================
// LISTA DE EVENTOS
// =============================================================================
// Componente async que obtiene y renderiza los eventos del usuario.
// Se usa dentro de <Suspense> para mostrar el skeleton mientras carga.

/**
 * Obtiene y renderiza los eventos del usuario autenticado.
 *
 * ## Filtro de usuario
 * Solo muestra eventos donde organizerId === userId.
 * El filtrado ocurre en la capa de datos (getEventsByOrganizer),
 * no en el cliente, para evitar exponer datos de otros usuarios.
 *
 * @param userId - UID del usuario autenticado
 */
async function MyEventsList({ userId }: { userId: string }): Promise<React.ReactElement> {
  const events = await getEventsByOrganizer(userId);

  if (!events || events.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        // Pasamos currentUserId para que EventCard muestre los botones
        // de edición y eliminación solo al organizador del evento.
        <EventCard
          key={event.id}
          event={event}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

/**
 * Página "Mis Eventos".
 *
 * ## Protección de ruta
 * La autenticación se valida en el servidor antes de renderizar.
 * Si el token no existe o es inválido, redirigimos a /auth.
 * Esto evita que el cliente reciba datos de otros usuarios.
 *
 * ## ¿Por qué validar aquí y no solo en middleware?
 * El middleware protege la navegación, pero un atacante podría
 * hacer fetch directo a esta ruta. Validar en el Server Component
 * garantiza que la protección esté en la capa de datos.
 */
export default async function MyEventsPage(): Promise<React.ReactElement> {
  // ---------------------------------------------------------------------------
  // AUTENTICACIÓN
  // ---------------------------------------------------------------------------
  // Leemos el token de la cookie httpOnly establecida al iniciar sesión.
  // Si no existe o es inválido, redirigimos al login.
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-auth-token')?.value;

  if (!token) {
    redirect('/auth');
  }

  let userId: string;

  try {
    // Verificamos el token con Firebase Admin SDK (solo en el servidor).
    // Si el token expiró o fue manipulado, verifyIdToken lanza un error.
    const decoded = await adminAuth.verifyIdToken(token);
    userId = decoded.uid;
  } catch {
    // Token inválido o expirado → redirigir al login
    redirect('/auth');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Eventos</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona y edita los eventos que has creado.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/events/new">
            <Plus className="h-4 w-4" />
            Crear evento
          </Link>
        </Button>
      </div>

      {/* Lista con estado de carga */}
      {/*
       * Suspense muestra el skeleton mientras MyEventsList
       * espera la respuesta del servidor (getEventsByOrganizer).
       */}
      <Suspense fallback={<MyEventsSkeleton />}>
        <MyEventsList userId={userId} />
      </Suspense>
    </div>
  );
}