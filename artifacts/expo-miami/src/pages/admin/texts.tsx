import { useState, useRef, useEffect, useCallback } from "react";
import { useGetAdminSettings, useUpdateSetting } from "@workspace/api-client-react";
import { getGetAdminSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SiteSetting } from "@workspace/api-client-react";

export default function AdminTexts() {
  const { data: settings, isLoading } = useGetAdminSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const textSettings = settings?.filter(s => s.type === "text" || s.type === "html") || [];
  
  const grouped = textSettings.reduce((acc, curr) => {
    if (!acc[curr.section]) acc[curr.section] = [];
    acc[curr.section].push(curr);
    return acc;
  }, {} as Record<string, typeof textSettings>);

  const tabs = Object.keys(grouped);

  const handleUpdate = async (key: string, value: string) => {
    try {
      await updateSetting.mutateAsync({ data: { key, value } });
      toast({
        title: "Guardado",
        description: "El texto ha sido actualizado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
    } catch (e) {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Textos</h1>
        <p className="text-muted-foreground mt-2">
          Edita el contenido de texto de la página pública.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <Tabs defaultValue={tabs[0]} className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto">
            {tabs.map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{tab}</CardTitle>
                  <CardDescription>
                    Configuración de textos para la sección {tab}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {grouped[tab].map(setting => (
                    <SettingField 
                      key={setting.key} 
                      setting={setting} 
                      onSave={handleUpdate} 
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function SettingField({ setting, onSave }: { setting: SiteSetting, onSave: (k: string, v: string) => void }) {
  const [value, setValue] = useState(setting.value || "");
  
  useEffect(() => {
    setValue(setting.value || "");
  }, [setting.value]);

  return (
    <div className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
      <Label className="text-base">{setting.label}</Label>
      {setting.hint && <p className="text-xs text-muted-foreground">{setting.hint}</p>}
      
      <div className="flex gap-2">
        {setting.type === "html" || value.length > 50 ? (
          <Textarea 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            className="min-h-[100px]"
          />
        ) : (
          <Input 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
          />
        )}
        <Button 
          variant="secondary" 
          onClick={() => onSave(setting.key, value)}
          disabled={value === setting.value}
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
