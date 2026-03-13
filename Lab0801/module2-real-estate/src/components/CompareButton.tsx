import { Button } from "@/components/ui/button";
import { Scale, Check } from "lucide-react";

interface CompareButtonProps {
  property: any;
  isSelected: boolean;
  onToggle: (property: any) => void;
  disabled: boolean;
}

export function CompareButton({ property, isSelected, onToggle, disabled }: CompareButtonProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className="w-full mt-2"
      disabled={disabled && !isSelected}
      onClick={(e) => {
        e.preventDefault(); 
        onToggle(property);
      }}
    >
      {isSelected ? <Check className="mr-2 h-4 w-4" /> : <Scale className="mr-2 h-4 w-4" />}
      {isSelected ? "Seleccionado" : "Comparar"}
    </Button>
  );
}