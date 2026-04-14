import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// ── Pages chargées immédiatement (critiques)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MemberDashboard from "./pages/MemberDashboard";

// ── Pages chargées à la demande (code splitting)
const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Members        = lazy(() => import("./pages/Members"));
const Seasons        = lazy(() => import("./pages/Seasons"));
const Payments       = lazy(() => import("./pages/Payments"));
const Reports        = lazy(() => import("./pages/Reports"));
const Users          = lazy(() => import("./pages/Users"));
const BoardMembers   = lazy(() => import("./pages/BoardMembers"));
const Reminders      = lazy(() => import("./pages/Reminders"));
const Expenses       = lazy(() => import("./pages/Expenses"));
const CardGenerator  = lazy(() => import("./pages/CardGenerator"));
const Cotisations    = lazy(() => import("./pages/Cotisations"));
const Settings       = lazy(() => import("./pages/Settings"));
const AdminPublicSite = lazy(() => import("./pages/AdminPublicSite"));

// ── Spinner de chargement partagé
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-navy border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Chargement…</p>
      </div>
    </div>
  );
}

// ── QueryClient optimisé : données fraîches 60s, cache 5min
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000,      // 1 min avant de re-fetcher
      gcTime: 5 * 60_000,    // 5 min en cache avant GC
    },
    mutations: {
      retry: 0,              // Pas de retry automatique sur les mutations
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              {/* ── Espace Membre (chargement immédiat) */}
              <Route path="/dashboard/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/dashboard/member" element={
                <ProtectedRoute><MemberDashboard /></ProtectedRoute>
              } />

              {/* ── Staff (lazy) */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireStaff><Dashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/members" element={
                <ProtectedRoute requireStaff><Members /></ProtectedRoute>
              } />
              <Route path="/dashboard/seasons" element={
                <ProtectedRoute requireStaff><Seasons /></ProtectedRoute>
              } />
              <Route path="/dashboard/payments" element={
                <ProtectedRoute requireStaff><Payments /></ProtectedRoute>
              } />
              <Route path="/dashboard/cotisations" element={
                <ProtectedRoute requireStaff><Cotisations /></ProtectedRoute>
              } />
              <Route path="/dashboard/reports" element={
                <ProtectedRoute requireStaff><Reports /></ProtectedRoute>
              } />
              <Route path="/dashboard/expenses" element={
                <ProtectedRoute requireStaff><Expenses /></ProtectedRoute>
              } />
              <Route path="/dashboard/board" element={
                <ProtectedRoute requireStaff><BoardMembers /></ProtectedRoute>
              } />
              <Route path="/dashboard/reminders" element={
                <ProtectedRoute requireStaff><Reminders /></ProtectedRoute>
              } />
              <Route path="/dashboard/card" element={
                <ProtectedRoute requireStaff><CardGenerator /></ProtectedRoute>
              } />

              {/* ── Admin (lazy) */}
              <Route path="/dashboard/users" element={
                <ProtectedRoute requireAdmin><Users /></ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute requireAdmin><Settings /></ProtectedRoute>
              } />
              <Route path="/dashboard/public-site" element={
                <ProtectedRoute requireAdmin><AdminPublicSite /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
