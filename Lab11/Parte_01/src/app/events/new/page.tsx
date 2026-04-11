// =============================================================================
// PÁGINA CREAR EVENTO
// =============================================================================
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { EventForm } from '@/components/EventForm';
import { createEventAction } from '@/actions/eventActions';

export const metadata: Metadata = {
  title: 'Crear Evento',
  description: 'Crea un nuevo evento.',
};

export default async function NewEventPage(): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const token = cookieStore.get('firebase-auth-token')?.value;

  if (!token) {
    redirect('/auth');
  }

  try {
    await adminAuth.verifyIdToken(token);
  } catch {
    redirect('/auth');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Crear Evento</h1>
        <p className="mt-1 text-muted-foreground">
          Completa el formulario para publicar tu evento.
        </p>
      </div>
      <EventForm />
    </div>
  );
}