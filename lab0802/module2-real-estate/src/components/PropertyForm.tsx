import type React from 'react';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImagePlus, X } from 'lucide-react'; // Iconos para la carga

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPropertySchema,
  type CreatePropertyInput,
  PROPERTY_TYPES,
  OPERATION_TYPES,
  PROPERTY_TYPE_LABELS,
  OPERATION_TYPE_LABELS,
} from '@/types/property';

interface PropertyFormProps {
  defaultValues?: Partial<CreatePropertyInput>;
  onSubmit: (data: CreatePropertyInput) => void;
  isSubmitting?: boolean;
}

export function PropertyForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: PropertyFormProps): React.ReactElement {
  // Estado local para manejar las URLs de las imágenes cargadas
  const [previewImages, setPreviewImages] = useState<string[]>(defaultValues?.images ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePropertyInput>({
    resolver: async (values) => {
      const result = createPropertySchema.safeParse(values);
      if (result.success) return { values: result.data, errors: {} };
      
      const errors = result.error.issues.reduce(
        (allErrors, currentError) => ({
          ...allErrors,
          [currentError.path[0]]: { type: currentError.code, message: currentError.message },
        }),
        {} as Record<string, { type: string; message: string }>
      );
      return { values: {}, errors };
    },
    defaultValues: {
      title: '',
      description: '',
      propertyType: 'apartamento',
      operationType: 'venta',
      price: 0,
      address: '',
      city: '',
      bedrooms: 1,
      bathrooms: 1,
      area: 50,
      amenities: [],
      images: [],
      ...defaultValues,
    },
    mode: 'onTouched',
  });

  const operationType = watch('operationType');
  const propertyType = watch('propertyType');
  const descriptionValue = watch('description');

  /**
   * Procesa los archivos seleccionados y los convierte a Base64
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImages(prev => {
          const newImages = [...prev, base64String];
          // Actualizamos el valor en React Hook Form
          setValue('images', newImages, { shouldValidate: true });
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Elimina una imagen de la lista de carga
   */
  const removeImage = (indexToRemove: number) => {
    const newImages = previewImages.filter((_, index) => index !== indexToRemove);
    setPreviewImages(newImages);
    setValue('images', newImages, { shouldValidate: true });
  };

  const onValidationError = () => {
    toast.error('Por favor corrige los errores señalados en el formulario');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6">
      
      {/* SECCIÓN: INFORMACIÓN BÁSICA */}
      <Card>
        <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la propiedad *</Label>
            <Input id="title" {...register('title')} placeholder="Ej: Casa moderna..." />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea id="description" rows={5} {...register('description')} />
            <span className="text-xs text-muted-foreground">{descriptionValue?.length ?? 0}/50 caracteres</span>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN: TIPO Y OPERACIÓN */}
      <Card>
        <CardHeader><CardTitle>Tipo y Operación</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de propiedad</Label>
            <Select value={propertyType} onValueChange={(v) => setValue('propertyType', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Operación</Label>
            <Select value={operationType} onValueChange={(v) => setValue('operationType', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OPERATION_TYPES.map(t => <SelectItem key={t} value={t}>{OPERATION_TYPE_LABELS[t]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN: PRECIO Y UBICACIÓN */}
      <Card>
        <CardHeader><CardTitle>Precio y Ubicación</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Precio ($)</Label>
            <Input id="price" type="number" {...register('price', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register('city')} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECCIÓN: CARACTERÍSTICAS */}
      <Card>
        <CardHeader><CardTitle>Características</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Habitaciones</Label>
            <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Baños</Label>
            <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Área (m²)</Label>
            <Input type="number" {...register('area', { valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      {/* ========================================================== */}
      {/* NUEVA SECCIÓN: CARGA DE IMÁGENES (AL FINAL)               */}
      {/* ========================================================== */}
      <Card className="border-dashed border-2 bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" />
            Galería de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Grid de Previsualización */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((img, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden border bg-background">
                <img src={img} alt="Vista previa" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full hover:scale-110 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {/* Botón para añadir fotos */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 hover:bg-muted hover:border-primary transition group"
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-1" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">Añadir foto</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          {errors.images && (
            <p className="text-sm text-destructive">{errors.images.message}</p>
          )}
          
          <p className="text-xs text-muted-foreground">
            * Puedes subir múltiples imágenes. La primera será la imagen de portada.
          </p>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar Propiedad'}
      </Button>
    </form>
  );
}