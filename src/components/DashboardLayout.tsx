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
  User,
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
  const { isMobile, setOpenMobile } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-border no-print">
      <SidebarContent className="bg-navy text-white">
        {/* Logo Header - Responsive */}
        <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border-b border-navy-light">
          <img src={vovinamLogo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-bold leading-none whitespace-nowrap">VOVINAM</h2>
            <p className="text-xs text-white/70 leading-tight mt-0.5">UGB SC</p>
          </div>
        </div>

        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60 px-3 text-xs">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`relative group flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive(item.url)
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      title={item.title}
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Menu */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/60 px-3 text-xs">Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`relative group flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive(item.url)
                            ? 'bg-white/20 text-white'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                        title={item.title}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Section - Responsive */}
        <div className="mt-auto p-2 sm:p-4 border-t border-navy-light space-y-2">
          <div>
            <p className="text-xs text-white/60 font-semibold mb-2">Connecté</p>
            <p className="text-xs text-white/80 truncate font-medium">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 h-9"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Déconnexion</span>
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
          {/* Improved Header */}
          <header className="h-14 sm:h-16 border-b border-border bg-background flex items-center px-3 sm:px-4 md:px-6 gap-3 sm:gap-4 no-print sticky top-0 z-30">
            <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9" />

            <div className="flex-1 min-w-0" />

            {/* Mon espace link */}
            <NavLink
              to="/dashboard/member"
              title="Mon espace"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 sm:px-4 h-9 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-navy text-white shadow-md shadow-navy/20'
                    : 'hover:bg-navy/10 text-navy border border-navy/20 hover:border-navy/40'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Mon espace</span>
            </NavLink>

            {/* Profile icon */}
            <NavLink
              to="/dashboard/profile"
              title="Mon profil"
              className={({ isActive }) =>
                `h-9 w-9 flex items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-navy text-white'
                    : 'hover:bg-navy/10 text-navy'
                }`
              }
            >
              <User className="h-5 w-5" />
            </NavLink>
          </header>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-full p-4 sm:p-6 md:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
