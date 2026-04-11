// =============================================================================
// COMPONENTE HEADER - Module 5: EventPass Pro
// =============================================================================
// Header de navegación con autenticación.
//
// ## Client Component
// Este componente es Client Component porque contiene UserMenu
// que usa el contexto de autenticación.
// =============================================================================

'use client';
import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';

export function Header(): React.ReactElement {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">EventPass</span>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Pro
          </span>
        </Link>

        {/* Navegación */}
        <nav className="flex items-center gap-4">
          <Link href="/events" className="text-sm font-medium hover:text-primary">
            Eventos
          </Link>
          {user && (
            <Link href="/my-events" className="text-sm font-medium hover:text-primary">
              Mis Eventos
            </Link>
          )}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}