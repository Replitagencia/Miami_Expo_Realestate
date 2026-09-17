import { useState } from "react";
import { useGetAdminLeads } from "@workspace/api-client-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getToken } from "@/lib/auth";

export default function AdminLeads() {
  const [capitalFilter, setCapitalFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const queryParams: Record<string, string> = {};
  if (capitalFilter !== "all") queryParams.capitalRange = capitalFilter;
  if (dateFrom) queryParams.dateFrom = dateFrom;
  if (dateTo) queryParams.dateTo = dateTo;

  const { data: leads, isLoading } = useGetAdminLeads(
    queryParams,
    {
      query: {
        queryKey: ["adminLeads", capitalFilter, dateFrom, dateTo]
      } as any
    }
  );

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (capitalFilter !== "all") params.append("capitalRange", capitalFilter);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const token = getToken();
      const response = await fetch(`${import.meta.env.BASE_URL}api/admin/leads/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Error exporting");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Error al exportar CSV");
    }
  };

  const clearFilters = () => {
    setCapitalFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = capitalFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y exporta los contactos recibidos.
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4 p-4 bg-card border rounded-lg">
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Capital</label>
          <Select value={capitalFilter} onValueChange={setCapitalFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtro Capital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="$1M-$2M">$1M - $2M</SelectItem>
              <SelectItem value="$2M-$5M">$2M - $5M</SelectItem>
              <SelectItem value="Mas de $5M">Más de $5M</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Desde</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="min-w-[160px]">
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Hasta</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email / Teléfono</TableHead>
              <TableHead>Capital</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : !leads || leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No se encontraron leads.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead: any) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div>{lead.email}</div>
                    {lead.phone && <div className="text-xs text-muted-foreground">{lead.phone}</div>}
                  </TableCell>
                  <TableCell>{lead.capitalRange || "-"}</TableCell>
                  <TableCell>{lead.investmentStage || "-"}</TableCell>
                  <TableCell>{format(new Date(lead.createdAt), "d MMM, yyyy", { locale: es })}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
