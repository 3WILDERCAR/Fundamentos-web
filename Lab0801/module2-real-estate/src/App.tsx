// =============================================================================
// APP COMPONENT - Module 2: Real Estate React
// =============================================================================
// Componente raíz de la aplicación que configura:
// - Routing con React Router
// - Layout general
// - Providers globales (si los hubiera)
//
// ## React Router v7
// React Router es el estándar para routing en aplicaciones React.
// Usamos Routes y Route para definir las páginas de la aplicación.
// =============================================================================

import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Home, Building2, Scale } from 'lucide-react';
import { HomePage } from '@/pages/HomePage';
import { NewPropertyPage } from '@/pages/NewPropertyPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { ComparePage } from '@/pages/ComparePage'; // Importar la página que crearás

function App() {
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);

  const toggleComparison = (property: any) => {
    const isSelected = selectedProperties.find((p) => p.id === property.id);
    if (isSelected) {
      setSelectedProperties(selectedProperties.filter((p) => p.id !== property.id));
    } else if (selectedProperties.length < 3) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Building2 className="h-6 w-6 text-primary" />
              <span>RealEstate</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Inicio</Link>
              <Link to="/compare" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                <Scale className="h-4 w-4" />
                Comparar ({selectedProperties.length})
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            {/* Usamos 'as any' para ignorar el error de TS ya que no podemos tocar HomePage */}
            <Route path="/" element={
              <HomePage 
                {...({ 
                  selectedProperties, 
                  onToggleComparison: toggleComparison 
                } as any)} 
              />
            } />
            
            <Route path="/compare" element={
              <ComparePage 
                selectedProperties={selectedProperties} 
                onRemove={(id: string) => setSelectedProperties(selectedProperties.filter(p => p.id !== id))} 
              />
            } />
            
            <Route path="/new" element={<NewPropertyPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;