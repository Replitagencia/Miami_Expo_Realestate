import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

import Landing from "@/pages/index";
import AdminLogin from "@/pages/admin/login";
import AdminLayout from "@/pages/admin/layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminImages from "@/pages/admin/images";
import AdminTexts from "@/pages/admin/texts";
import AdminLeads from "@/pages/admin/leads";
import AdminSeo from "@/pages/admin/seo";
import AdminNotifications from "@/pages/admin/notifications";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  if (!user) {
    return <Redirect to="/admin" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard">
        {() => (
          <AdminLayout>
            <ProtectedRoute component={AdminDashboard} />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/images">
        {() => (
          <AdminLayout>
            <ProtectedRoute component={AdminImages} />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/texts">
        {() => (
          <AdminLayout>
            <ProtectedRoute component={AdminTexts} />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/leads">
        {() => (
          <AdminLayout>
            <ProtectedRoute component={AdminLeads} />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/seo">
        {() => (
          <AdminLayout>
            <ProtectedRoute component={AdminSeo} />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/notifications">
        {() => (
          <AdminLayout>
            <ProtectedRoute component={AdminNotifications} />
          </AdminLayout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
