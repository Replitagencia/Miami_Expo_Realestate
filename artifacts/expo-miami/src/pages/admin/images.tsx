import { useState, useRef } from "react";
import { useGetAdminSettings, useUploadSettingImage } from "@workspace/api-client-react";
import { getGetAdminSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Monitor, Smartphone, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import type { SiteSetting } from "@workspace/api-client-react";

type SlotSpec = {
  key: string;
  label: string;
  description: string;
  desktop: string;
  mobile: string;
  hint: string;
  aspectClass: string;
  mobileKey?: string;
  mobileDesktop?: string;
  mobileHint?: string;
  mobileAspectClass?: string;
};

type PageSection = {
  id: string;
  title: string;
  emoji: string;
  slots: SlotSpec[];
};

const PAGE_SECTIONS: PageSection[] = [
  {
    id: "hero",
    title: "Hero — Portada principal",
    emoji: "🏙️",
    slots: [
      {
        key: "hero_image",
        label: "Imagen 1 del carrusel",
        description: "Primera imagen del carrusel del hero. Se muestra siempre que esté configurada. Prioriza el lado izquierdo del cielo.",
        desktop: "1920 × 1080",
        mobile: "828 × 1400",
        hint: "JPG o WebP · máx 3MB",
        aspectClass: "aspect-video",
        mobileKey: "hero_image_mobile",
        mobileDesktop: "828 × 1400",
        mobileHint: "JPG · máx 2MB · Vertical portrait",
        mobileAspectClass: "aspect-[3/5]",
      },
      {
        key: "hero_image_2",
        label: "Imagen 2 del carrusel",
        description: "Segunda imagen del carrusel del hero. Opcional — solo se muestra si está configurada.",
        desktop: "1920 × 1080",
        mobile: "828 × 1400",
        hint: "JPG o WebP · máx 3MB",
        aspectClass: "aspect-video",
        mobileKey: "hero_image_2_mobile",
        mobileDesktop: "828 × 1400",
        mobileHint: "JPG · máx 2MB · Vertical portrait",
        mobileAspectClass: "aspect-[3/5]",
      },
      {
        key: "hero_image_3",
        label: "Imagen 3 del carrusel",
        description: "Tercera imagen del carrusel del hero. Opcional — solo se muestra si está configurada.",
        desktop: "1920 × 1080",
        mobile: "828 × 1400",
        hint: "JPG o WebP · máx 3MB",
        aspectClass: "aspect-video",
        mobileKey: "hero_image_3_mobile",
        mobileDesktop: "828 × 1400",
        mobileHint: "JPG · máx 2MB · Vertical portrait",
        mobileAspectClass: "aspect-[3/5]",
      },
    ],
  },
  {
    id: "global",
    title: "Global — Elementos comunes",
    emoji: "🌐",
    slots: [
      {
        key: "logo",
        label: "Logo principal",
        description: "Logo que aparece en el navbar, footer y panel de administración. Fondo transparente o negro.",
        desktop: "400 × 120",
        mobile: "200 × 60",
        hint: "PNG transparente · máx 200KB",
        aspectClass: "aspect-[400/120]",
      },
      {
        key: "banner_strip_image",
        label: "Franja panorámica entre secciones",
        description: "Imagen de skyline panorámico que aparece entre la barra de métricas y la sección de zonas. Perfecta para una vista aérea de Miami.",
        desktop: "1920 × 600",
        mobile: "828 × 400",
        hint: "JPG o WebP · máx 2MB · Skyline horizontal",
        aspectClass: "aspect-[16/5]",
        mobileKey: "banner_strip_image_mobile",
        mobileDesktop: "828 × 400",
        mobileHint: "JPG · máx 2MB · Panorámica móvil",
        mobileAspectClass: "aspect-[828/400]",
      },
      {
        key: "og_image",
        label: "Imagen para redes sociales (OG Image)",
        description: "Se muestra como vista previa al compartir el sitio en WhatsApp, LinkedIn, Twitter, etc. No aparece en la página.",
        desktop: "1200 × 630",
        mobile: "600 × 315",
        hint: "JPG · máx 1MB · Incluir logo y texto clave",
        aspectClass: "aspect-[1200/630]",
      },
    ],
  },
  {
    id: "scenes",
    title: "Zonas — Sección Miami",
    emoji: "🗺️",
    slots: [
      {
        key: "scene_1_image",
        label: "Brickell",
        description: "Zona financiera. Ideal: torres de cristal, skyline nocturno.",
        desktop: "800 × 500",
        mobile: "400 × 300",
        hint: "JPG · máx 1MB",
        aspectClass: "aspect-[4/3]",
      },
      {
        key: "scene_2_image",
        label: "South Beach",
        description: "Playa & vida nocturna. Ideal: Ocean Drive, playa al atardecer.",
        desktop: "800 × 500",
        mobile: "400 × 300",
        hint: "JPG · máx 1MB",
        aspectClass: "aspect-[4/3]",
      },
      {
        key: "scene_3_image",
        label: "Edgewater & Wynwood",
        description: "Arte & gastronomía. Ideal: murales, terrazas, vida urbana.",
        desktop: "800 × 500",
        mobile: "400 × 300",
        hint: "JPG · máx 1MB",
        aspectClass: "aspect-[4/3]",
      },
      {
        key: "scene_4_image",
        label: "Coral Gables",
        description: "Residencial premium. Ideal: mansiones, jardines, piscinas.",
        desktop: "800 × 500",
        mobile: "400 × 300",
        hint: "JPG · máx 1MB",
        aspectClass: "aspect-[4/3]",
      },
    ],
  },
  {
    id: "about",
    title: "Inversión & Agencia",
    emoji: "🏢",
    slots: [
      {
        key: "about_image",
        label: "Foto lifestyle",
        description: "Imagen vertical que aparece al lado del texto 'Construye tu legado' en la sección Invertir.",
        desktop: "800 × 1000",
        mobile: "400 × 500",
        hint: "JPG · máx 1MB · Preferiblemente vertical",
        aspectClass: "aspect-[4/5]",
      },
      {
        key: "agency_image",
        label: "Foto de agencia",
        description: "Banner panorámico que aparece debajo del texto en la sección 'La Agencia'.",
        desktop: "1600 × 700",
        mobile: "800 × 350",
        hint: "JPG · máx 1MB · Panorámica (horizontal)",
        aspectClass: "aspect-[16/7]",
      },
    ],
  },
  {
    id: "team",
    title: "Equipo — Fotos profesionales",
    emoji: "👤",
    slots: [
      {
        key: "team_1_image",
        label: "Miriam Daniel",
        description: "Foto profesional — fondo neutro o interior de oficina.",
        desktop: "600 × 800",
        mobile: "300 × 400",
        hint: "JPG · máx 1MB · Retrato vertical",
        aspectClass: "aspect-[3/4]",
      },
      {
        key: "team_2_image",
        label: "Sara Pineda",
        description: "Foto profesional — fondo neutro o interior de oficina.",
        desktop: "600 × 800",
        mobile: "300 × 400",
        hint: "JPG · máx 1MB · Retrato vertical",
        aspectClass: "aspect-[3/4]",
      },
      {
        key: "team_3_image",
        label: "Estella Beniflah",
        description: "Foto profesional — fondo neutro o interior de oficina.",
        desktop: "600 × 800",
        mobile: "300 × 400",
        hint: "JPG · máx 1MB · Retrato vertical",
        aspectClass: "aspect-[3/4]",
      },
    ],
  },
  {
    id: "sima",
    title: "Banner de asesoría",
    emoji: "🏙️",
    slots: [
      {
        key: "sima_bg_image",
        label: "Fondo del banner de asesoría",
        description: "Imagen de fondo bajo la capa dorada. Ideal: skyline de Miami, arquitectura o una vista de la bahía.",
        desktop: "1920 × 700",
        mobile: "828 × 500",
        hint: "JPG · máx 2MB · Panorámica horizontal",
        aspectClass: "aspect-[16/6]",
        mobileKey: "sima_bg_image_mobile",
        mobileDesktop: "828 × 500",
        mobileHint: "JPG · máx 2MB · Panorámica móvil",
        mobileAspectClass: "aspect-[828/500]",
      },
    ],
  },
];

export default function AdminImages() {
  const { data: settings, isLoading } = useGetAdminSettings();
  const uploadMutation = useUploadSettingImage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  function resolveAdminImageUrl(value: string | null, type: string): string | null {
    if (!value || type !== "image") return value;
    if (value.startsWith("/objects/")) return `/api/storage${value}`;
    return value;
  }

  const settingsMap: Record<string, SiteSetting> = {};
  if (settings) {
    for (const s of settings) {
      settingsMap[s.key] = s;
    }
  }

  const handleUpload = async (key: string, file: File): Promise<void> => {
    try {
      await uploadMutation.mutateAsync({ data: { key, image: file } });
      toast({
        title: "Imagen actualizada",
        description: "La imagen se ha subido correctamente.",
      });
      await queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
    } catch {
      toast({
        title: "Error al subir",
        description: "Hubo un problema. Verifica el tamaño y formato del archivo.",
        variant: "destructive",
      });
      throw new Error("Upload failed");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Imágenes</h1>
          <p className="text-muted-foreground mt-2">Cargando gestor de imágenes...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Imágenes</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona todas las fotografías del sitio. Cada imagen muestra el tamaño recomendado para escritorio y móvil.
        </p>
      </div>

      {PAGE_SECTIONS.map(section => (
        <div key={section.id} className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <span className="text-2xl">{section.emoji}</span>
            <div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
          </div>

          <div className={`grid gap-5 ${section.slots.length === 1 ? "grid-cols-1 max-w-xl" : section.slots.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {section.slots.map(slot => (
              <ImageSlotCard
                key={slot.key}
                slot={slot}
                currentValue={resolveAdminImageUrl(settingsMap[slot.key]?.value ?? null, settingsMap[slot.key]?.type ?? "image")}
                currentMobileValue={slot.mobileKey ? resolveAdminImageUrl(settingsMap[slot.mobileKey]?.value ?? null, settingsMap[slot.mobileKey]?.type ?? "image") : null}
                onUpload={handleUpload}
                isUploading={uploadMutation.isPending}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UploadArea({
  aspectClass,
  displayUrl,
  label,
  isDirty,
  inputRef,
  onDrop,
  onFileChange,
}: {
  aspectClass: string;
  displayUrl: string | null;
  label: string;
  isDirty: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const hasImage = !!displayUrl;
  return (
    <div
      className={`${aspectClass} relative rounded-lg overflow-hidden border-2 border-dashed transition-colors cursor-pointer ${isDirty ? "border-primary" : "border-border hover:border-muted-foreground/50"}`}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      {hasImage ? (
        <img src={displayUrl!} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <ImageIcon className="h-8 w-8 opacity-30" />
          <span className="text-xs">Sin imagen — haz clic o arrastra aquí</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex flex-col items-center text-white gap-1">
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">{hasImage ? "Cambiar imagen" : "Subir imagen"}</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}

function ImageSlotCard({
  slot,
  currentValue,
  currentMobileValue,
  onUpload,
  isUploading,
}: {
  slot: SlotSpec;
  currentValue: string | null;
  currentMobileValue: string | null;
  onUpload: (key: string, file: File) => Promise<void>;
  isUploading: boolean;
}) {
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mobileLocalFile, setMobileLocalFile] = useState<File | null>(null);
  const [mobileLocalPreview, setMobileLocalPreview] = useState<string | null>(null);
  const [mobileSaved, setMobileSaved] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [showMobile, setShowMobile] = useState(!!currentMobileValue);

  const displayUrl = localPreview ?? currentValue;
  const hasImage = !!displayUrl;
  const isDirty = !!localFile;

  const mobileDisplayUrl = mobileLocalPreview ?? currentMobileValue;
  const hasMobileImage = !!mobileDisplayUrl;
  const isMobileDirty = !!mobileLocalFile;

  const hasMobileSlot = !!slot.mobileKey;

  const handleFileChange = (file: File) => {
    setLocalFile(file);
    setSaved(false);
    setLocalPreview(URL.createObjectURL(file));
  };

  const handleMobileFileChange = (file: File) => {
    setMobileLocalFile(file);
    setMobileSaved(false);
    setMobileLocalPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!localFile) return;
    try {
      await onUpload(slot.key, localFile);
      setSaved(true);
      setLocalFile(null);
      setLocalPreview(null);
    } catch {
    }
  };

  const handleMobileSave = async () => {
    if (!mobileLocalFile || !slot.mobileKey) return;
    try {
      await onUpload(slot.mobileKey, mobileLocalFile);
      setMobileSaved(true);
      setMobileLocalFile(null);
      setMobileLocalPreview(null);
    } catch {
    }
  };

  return (
    <Card className="overflow-hidden border-border">
      <div className="p-4 space-y-1 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{slot.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{slot.description}</p>
          </div>
          {hasImage && !isDirty && (
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="outline" className="text-xs gap-1 py-0.5">
            <Monitor className="h-3 w-3" />
            {slot.desktop}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1 py-0.5">
            <Smartphone className="h-3 w-3" />
            {slot.mobile}
          </Badge>
          <Badge variant="secondary" className="text-xs py-0.5">{slot.hint}</Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <UploadArea
          aspectClass={slot.aspectClass}
          displayUrl={displayUrl}
          label={slot.label}
          isDirty={isDirty}
          inputRef={inputRef}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]); }}
          onFileChange={e => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }}
        />

        {isDirty && (
          <div className="flex items-center gap-2">
            <Button size="sm" className="flex-1" onClick={handleSave} disabled={isUploading}>
              {isUploading ? "Subiendo..." : "Guardar imagen"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setLocalFile(null); setLocalPreview(null); }}>
              Cancelar
            </Button>
          </div>
        )}

        {saved && !isDirty && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Imagen guardada
          </p>
        )}

        {hasMobileSlot && (
          <div className="border-t border-border pt-3 space-y-2">
            <button
              type="button"
              onClick={() => setShowMobile(v => !v)}
              className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5" />
                <span className="font-medium">Versión móvil diferente (opcional)</span>
                {hasMobileImage && !isMobileDirty && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </div>
              {showMobile ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {!showMobile && (
              <p className="text-xs text-muted-foreground/70 pl-5">
                {hasMobileImage ? "Versión móvil configurada" : "Usando la misma imagen en móvil"}
              </p>
            )}

            {showMobile && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs gap-1 py-0.5">
                    <Smartphone className="h-3 w-3" />
                    {slot.mobileDesktop}
                  </Badge>
                  <Badge variant="secondary" className="text-xs py-0.5">{slot.mobileHint}</Badge>
                </div>

                <UploadArea
                  aspectClass={slot.mobileAspectClass!}
                  displayUrl={mobileDisplayUrl}
                  label={`${slot.label} móvil`}
                  isDirty={isMobileDirty}
                  inputRef={mobileInputRef}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) handleMobileFileChange(e.dataTransfer.files[0]); }}
                  onFileChange={e => { if (e.target.files?.[0]) handleMobileFileChange(e.target.files[0]); }}
                />

                {isMobileDirty && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1" onClick={handleMobileSave} disabled={isUploading}>
                      {isUploading ? "Subiendo..." : "Guardar versión móvil"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setMobileLocalFile(null); setMobileLocalPreview(null); }}>
                      Cancelar
                    </Button>
                  </div>
                )}

                {mobileSaved && !isMobileDirty && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Versión móvil guardada
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
