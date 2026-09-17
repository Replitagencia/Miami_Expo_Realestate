import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Image as ImageIcon, FileText, Users, LogOut, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/texts", label: "Textos", icon: FileText },
  { href: "/admin/images", label: "Imágenes", icon: ImageIcon },
  { href: "/admin/seo", label: "SEO & Tracking", icon: Search },
  { href: "/admin/notifications", label: "Notificaciones", icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"][data-admin]');
    if (!existing) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      meta.setAttribute("content", "noindex, nofollow");
      meta.setAttribute("data-admin", "true");
      document.head.appendChild(meta);
    }
    return () => {
      const el = document.querySelector('meta[name="robots"][data-admin]');
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Expo Miami" className="h-10 w-auto mb-1" style={{ mixBlendMode: 'lighten' }} />
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                location === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium">{user?.username}</p>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
