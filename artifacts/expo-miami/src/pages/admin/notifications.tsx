import { useState, useEffect } from "react";
import { useGetAdminSettings, useUpdateSetting } from "@workspace/api-client-react";
import { getGetAdminSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Mail } from "lucide-react";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AdminNotifications() {
  const { data: settings, isLoading } = useGetAdminSettings();
  const updateSetting = useUpdateSetting();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const notificationSetting = settings?.find((s) => s.key === "notification_emails");

  useEffect(() => {
    if (notificationSetting?.value) {
      const parsed = notificationSetting.value
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);
      setEmails(parsed);
    }
  }, [notificationSetting?.value]);

  const saveEmails = async (updatedEmails: string[]) => {
    setIsSaving(true);
    try {
      await updateSetting.mutateAsync({
        data: { key: "notification_emails", value: updatedEmails.join(",") },
      });
      toast({
        title: "Guardado",
        description: "La lista de destinatarios ha sido actualizada.",
      });
      queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los destinatarios.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      toast({
        title: "Email inválido",
        description: "Por favor introduce una dirección de email válida.",
        variant: "destructive",
      });
      return;
    }
    if (emails.includes(trimmed)) {
      toast({
        title: "Email duplicado",
        description: "Este email ya está en la lista.",
        variant: "destructive",
      });
      return;
    }
    const updated = [...emails, trimmed];
    setEmails(updated);
    setNewEmail("");
    saveEmails(updated);
  };

  const handleRemove = (email: string) => {
    const updated = emails.filter((e) => e !== email);
    setEmails(updated);
    saveEmails(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Notificaciones</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona quién recibe las notificaciones de email cuando se registra un nuevo lead.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Destinatarios de notificaciones</CardTitle>
            <CardDescription>
              Estas direcciones recibirán un email cada vez que se registre un nuevo lead en la web.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {emails.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No hay destinatarios configurados. Añade al menos uno para recibir notificaciones.
                </p>
              ) : (
                <ul className="space-y-2">
                  {emails.map((email) => (
                    <li
                      key={email}
                      className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-4 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{email}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(email)}
                        disabled={isSaving}
                        aria-label={`Eliminar ${email}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Añadir destinatario</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="nuevo@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="max-w-sm"
                  disabled={isSaving}
                />
                <Button onClick={handleAdd} disabled={isSaving || !newEmail.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
