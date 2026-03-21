import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ComparePageProps {
  selectedProperties: any[];
  onRemove: (id: string) => void;
}

export function ComparePage({ selectedProperties, onRemove }: ComparePageProps) {
  if (selectedProperties.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No hay propiedades seleccionadas</h2>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const minPrice = Math.min(...selectedProperties.map(p => p.price));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/"><ArrowLeft className="h-6 w-6" /></Link>
        <h1 className="text-3xl font-bold">Comparar Propiedades</h1>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="p-4 border">Característica</th>
              {selectedProperties.map(p => (
                <th key={p.id} className="p-4 border min-w-[200px]">
                  <div className="flex justify-between items-start">
                    <span className="font-bold">{p.title}</span>
                    <Button variant="ghost" size="icon" onClick={() => onRemove(p.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border font-medium">Precio</td>
              {selectedProperties.map(p => (
                <td key={p.id} className={`p-4 border ${p.price === minPrice ? "bg-green-100 dark:bg-green-900/30 font-bold" : ""}`}>
                  ${p.price.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border font-medium">Habitaciones</td>
              {selectedProperties.map(p => (
                <td key={p.id} className="p-4 border">{p.bedrooms || p.rooms}</td>
              ))}
            </tr>
            <tr>
              <td className="p-4 border font-medium">Baños</td>
              {selectedProperties.map(p => (
                <td key={p.id} className="p-4 border">{p.bathrooms}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}