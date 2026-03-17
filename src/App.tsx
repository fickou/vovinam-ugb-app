import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Seasons from "./pages/Seasons";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import BoardMembers from "./pages/BoardMembers";
import Reminders from "./pages/Reminders";
import Expenses from "./pages/Expenses";
import CardGenerator from "./pages/CardGenerator";
import Cotisations from "./pages/Cotisations";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import AdminPublicSite from "./pages/AdminPublicSite";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/members" element={
              <ProtectedRoute requireStaff>
                <Members />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/seasons" element={
              <ProtectedRoute requireStaff>
                <Seasons />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/payments" element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/cotisations" element={
              <ProtectedRoute requireStaff>
                <Cotisations />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/reports" element={
              <ProtectedRoute requireStaff>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/expenses" element={
              <ProtectedRoute requireStaff>
                <Expenses />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/board" element={
              <ProtectedRoute>
                <BoardMembers />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/reminders" element={
              <ProtectedRoute requireStaff>
                <Reminders />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/card" element={
              <ProtectedRoute requireStaff>
                <CardGenerator />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/users" element={
              <ProtectedRoute requireAdmin>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute requireAdmin>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/public-site" element={
              <ProtectedRoute requireAdmin>
                <AdminPublicSite />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
