'use client';

import { useOptimistic, useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { registerForEventAction } from '@/actions/eventActions';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterButtonProps {
  eventId: string;
  availableSpots: number;
  isAvailable: boolean;
}

/**
 * Botón de registro con actualización optimista y feedback de éxito/error.
 *
 * ## Flujo
 * 1. Click → addOptimistic resta 1 plaza inmediatamente
 * 2. startTransition ejecuta la Server Action
 * 3. isPending=true → spinner visible, botón deshabilitado
 * 4. Éxito → mensaje de confirmación verde
 * 5. Error → mensaje rojo + estado optimista revertido automáticamente
 */
export function RegisterButton({
  eventId,
  availableSpots,
  isAvailable,
}: RegisterButtonProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();

  // Estado para feedback de éxito/error
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  /**
   * useOptimistic — actualiza la UI antes de que el servidor responda.
   * Si la Server Action falla, React revierte automáticamente al valor inicial.
   */
  const [optimisticSpots, addOptimistic] = useOptimistic(
    availableSpots,
    (currentSpots: number, _action: 'register') => Math.max(0, currentSpots - 1)
  );

  // Estado derivado
  const showRegistered = optimisticSpots < availableSpots;
  const canRegister = isAvailable && optimisticSpots > 0 && !showRegistered;

  async function handleRegister(): Promise<void> {
    // Limpiar feedback anterior
    setFeedback(null);

    // 1. Actualización optimista inmediata (-1 plaza)
    addOptimistic('register');

    // 2. Server Action dentro de una transición
    startTransition(async () => {
      const result = await registerForEventAction(eventId);

      if (!result.success) {
        // Error → mostrar mensaje (el estado optimista se revierte solo)
        setFeedback({
          type: 'error',
          message: result.message ?? 'No se pudo completar el registro.',
        });
      } else {
        // Éxito → mostrar confirmación
        setFeedback({
          type: 'success',
          message: result.message ?? '¡Te has registrado correctamente!',
        });
      }
    });
  }

  return (
    <div className="space-y-2">
      {/* Botón principal */}
      {showRegistered && !feedback?.type.includes('error') ? (
        <Button variant="secondary" disabled className="w-full gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          ¡Registrado!
        </Button>
      ) : !canRegister && !showRegistered ? (
        <Button variant="secondary" disabled className="w-full">
          {optimisticSpots === 0 ? 'Evento Agotado' : 'No disponible'}
        </Button>
      ) : (
        <Button
          onClick={handleRegister}
          disabled={isPending}
          className={cn('w-full gap-2', isPending && 'cursor-wait')}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            `Registrarme (${optimisticSpots} ${optimisticSpots === 1 ? 'plaza' : 'plazas'})`
          )}
        </Button>
      )}

      {/* Feedback de éxito o error */}
      {feedback && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}
    </div>
  );
}