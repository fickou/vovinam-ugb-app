import { ReactNode } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  UserCog,
  Shield,
  Bell,
  Wallet,
  IdCard,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import vovinamLogo from '@/assets/logo.png';

interface DashboardLayoutProps {
  children: ReactNode;
}

const mainMenuItems = [
  { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Pratiquants', url: '/dashboard/members', icon: Users },
  { title: 'Saisons', url: '/dashboard/seasons', icon: Calendar },
  { title: 'Paiements', url: '/dashboard/payments', icon: CreditCard },
  { title: 'Cotisations', url: '/dashboard/cotisations', icon: FileText },
  { title: 'Dépenses', url: '/dashboard/expenses', icon: Wallet },
  { title: 'Le Bureau', url: '/dashboard/board', icon: Shield },
  { title: 'Rappels', url: '/dashboard/reminders', icon: Bell },
  { title: 'Carte', url: '/dashboard/card', icon: IdCard },
  { title: 'Rapports', url: '/dashboard/reports', icon: BarChart3 },
];

import { Globe } from 'lucide-react';

const adminMenuItems = [
  { title: 'Utilisateurs', url: '/dashboard/users', icon: UserCog },
  { title: 'Site Public', url: '/dashboard/public-site', icon: Globe },
  { title: 'Paramètres', url: '/dashboard/settings', icon: Settings },
];

function AppSidebar() {
  const location = useLocation();
  const { isAdmin, isStaff, signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-border no-print">
      <SidebarContent className="bg-navy text-white">
        <div className="p-4 flex items-center gap-3 border-b border-navy-light">
          <img src={vovinamLogo} alt="Logo" className="h-10 w-10 object-contain" />
          <div>
            <h2 className="font-display text-lg font-bold">VOVINAM</h2>
            <p className="text-xs text-white/70">UGB Sporting Club</p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive(item.url)
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/60">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive(item.url)
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="mt-auto p-4 border-t border-navy-light">
          <div className="text-sm text-white/70 mb-3">
            {user?.email}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full bg-transparent border-white/30 text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 bg-muted flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-background flex items-center px-4 md:px-6 gap-4 no-print sticky top-0 z-30">
            <SidebarTrigger>
              <Menu className="h-5 w-5 text-navy" />
            </SidebarTrigger>
            <div className="flex items-center justify-between w-full">
              <h1 className="font-display text-lg md:text-xl font-bold text-navy truncate">
                Gestion du Club
              </h1>
              <div className="flex items-center gap-2 md:hidden">
                <img src={vovinamLogo} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
            </div>
          </header>
          <div className="p-4 md:p-6 lg:p-8 flex-1">
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
