import { useGetAdminSettings, useUpdateSetting } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Save, ExternalLink } from "lucide-react";

interface SeoField {
  key: string;
  label: string;
  placeholder: string;
  hint: string;
  helpLink?: { label: string; url: string };
}

const SEO_FIELDS: SeoField[] = [
  {
    key: "og_title",
    label: "Título OG (redes sociales)",
    placeholder: "Expo Miami Real Estate — Inversión inmobiliaria de lujo desde España",
    hint: "Aparece como título al compartir la web en WhatsApp, LinkedIn o Twitter. Máx 60 caracteres recomendado.",
  },
  {
    key: "og_description",
    label: "Descripción OG (redes sociales)",
    placeholder: "Agencia licenciada en Florida especializada en inversores de alto patrimonio desde España.",
    hint: "Descripción breve que aparece al compartir. Máx 160 caracteres recomendado.",
  },
  {
    key: "canonical_url",
    label: "URL Canónica",
    placeholder: "https://expo-miami.replit.app/",
    hint: "URL canónica de la página principal. Ayuda a evitar contenido duplicado en buscadores. Incluye el protocolo (https://).",
  },
  {
    key: "gsc_verification",
    label: "Google Search Console — Código de verificación",
    placeholder: "abc123XYZmN8qP...",
    hint: 'Solo pega el valor del atributo "content" de la etiqueta meta que Google te proporciona. Ej: abc123XYZ',
    helpLink: {
      label: "Ir a Google Search Console",
      url: "https://search.google.com/search-console",
    },
  },
  {
    key: "meta_pixel_id",
    label: "Meta Pixel ID",
    placeholder: "123456789012345",
    hint: "ID numérico del píxel de Meta (Facebook). Lo encuentras en Meta Business Suite → Administrador de eventos → Orígenes de datos.",
    helpLink: {
      label: "Ir a Meta Business Suite",
      url: "https://business.facebook.com/events_manager",
    },
  },
  {
    key: "ga4_id",
    label: "Google Analytics 4 — Measurement ID",
    placeholder: "G-XXXXXXXXXX",
    hint: "Formato G-XXXXXXXX. Lo encuentras en GA4 → Administración → Flujos de datos → detalles del flujo web.",
    helpLink: {
      label: "Ir a Google Analytics",
      url: "https://analytics.google.com",
    },
  },
  {
    key: "gtm_id",
    label: "Google Tag Manager — Container ID",
    placeholder: "GTM-XXXXXX",
    hint: "Formato GTM-XXXXXX. Lo encuentras en tu cuenta de GTM junto al nombre del contenedor.",
    helpLink: {
      label: "Ir a Google Tag Manager",
      url: "https://tagmanager.google.com",
    },
  },
];

export default function AdminSeo() {
  const { data: settings, isLoading } = useGetAdminSettings();
  const updateMutation = useUpdateSetting();
  const { toast } = useToast();

  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!settings) return;
    const SEO_KEYS = ["og_title", "og_description", "canonical_url", "gsc_verification", "meta_pixel_id", "ga4_id", "gtm_id"];
    const seoSettings = settings.filter((s) => SEO_KEYS.includes(s.key));
    const initial: Record<string, string> = {};
    for (const s of seoSettings) {
      initial[s.key] = s.value ?? "";
    }
    setValues(initial);
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty((prev) => ({ ...prev, [key]: true }));
  };

  const handleSave = async (key: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await updateMutation.mutateAsync({ data: { key, value: values[key] ?? "" } });
      setDirty((prev) => ({ ...prev, [key]: false }));
      toast({ title: "Guardado", description: "El ajuste se ha actualizado correctamente." });
    } catch {
      toast({ title: "Error", description: "No se pudo guardar. Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">SEO &amp; Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configura el seguimiento de analíticas y los metadatos de tu sitio para redes sociales y buscadores.
          Todos los campos son opcionales; si se dejan vacíos la etiqueta correspondiente simplemente no se inyecta.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Metadatos para redes sociales</CardTitle>
          <CardDescription>Controlan cómo se ve el enlace al compartirlo en WhatsApp, LinkedIn o Twitter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SEO_FIELDS.filter((f) => ["og_title", "og_description", "canonical_url"].includes(f.key)).map((field) => (
            <SeoFieldRow
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              isDirty={!!dirty[field.key]}
              isSaving={!!saving[field.key]}
              onChange={(v) => handleChange(field.key, v)}
              onSave={() => handleSave(field.key)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Google Search Console</CardTitle>
          <CardDescription>Verifica la propiedad de tu sitio para acceder a datos de rendimiento en búsquedas.</CardDescription>
        </CardHeader>
        <CardContent>
          {SEO_FIELDS.filter((f) => f.key === "gsc_verification").map((field) => (
            <SeoFieldRow
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              isDirty={!!dirty[field.key]}
              isSaving={!!saving[field.key]}
              onChange={(v) => handleChange(field.key, v)}
              onSave={() => handleSave(field.key)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Analíticas &amp; Píxeles</CardTitle>
          <CardDescription>Activa el seguimiento de visitas y conversiones. Solo se cargan los scripts cuyos IDs estén rellenados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SEO_FIELDS.filter((f) => ["meta_pixel_id", "ga4_id", "gtm_id"].includes(f.key)).map((field) => (
            <SeoFieldRow
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              isDirty={!!dirty[field.key]}
              isSaving={!!saving[field.key]}
              onChange={(v) => handleChange(field.key, v)}
              onSave={() => handleSave(field.key)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SeoFieldRow({
  field,
  value,
  isDirty,
  isSaving,
  onChange,
  onSave,
}: {
  field: SeoField;
  value: string;
  isDirty: boolean;
  isSaving: boolean;
  onChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium">{field.label}</label>
        {field.helpLink && (
          <a
            href={field.helpLink.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {field.helpLink.label}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="flex-1"
        />
        <Button
          size="sm"
          variant={isDirty ? "default" : "outline"}
          disabled={!isDirty || isSaving}
          onClick={onSave}
          className="shrink-0 gap-1.5"
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Guardando…" : "Guardar"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{field.hint}</p>
    </div>
  );
}
