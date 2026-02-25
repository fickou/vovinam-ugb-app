import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import vovinamLogo from '@/assets/logo.png';

const Index = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-navy/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-martial/5 rounded-full blur-3xl animate-pulse"></div>

      <main className="text-center space-y-12 max-w-2xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="space-y-6">
          <div className="inline-block p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-navy/10 transform transition-transform hover:scale-110 duration-500">
            <img
              src={vovinamLogo}
              alt="Logo VOVINAM VIET VO DAO UGB"
              className="h-28 w-28 sm:h-36 sm:w-36 mx-auto object-contain"
            />
          </div>

          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-navy uppercase leading-none">
              VOVINAM <span className="text-red-martial">UGB</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-navy/10 flex-1 max-w-[40px]"></div>
              <p className="text-xl md:text-2xl text-slate-500 font-display font-bold tracking-[0.2em] uppercase">
                Sporting Club
              </p>
              <div className="h-px bg-navy/10 flex-1 max-w-[40px]"></div>
            </div>
          </header>
        </div>

        <div className="space-y-8">
          <p className="text-slate-400 font-medium text-lg max-w-md mx-auto leading-relaxed">
            Plongez dans l'excellence martiale avec notre plateforme de gestion dédiée au Vovinam Viet Vo Dao.
          </p>

          <nav className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center px-4" aria-label="Navigation principale">
            {user ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-16 px-10 rounded-2xl bg-navy hover:bg-black text-white font-bold text-lg shadow-xl shadow-navy/20 transition-all active:scale-95 flex gap-3">
                  <LayoutDashboard className="h-6 w-6" />
                  Tableau de bord
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-16 px-10 rounded-2xl bg-red-martial hover:bg-black text-white font-bold text-lg shadow-xl shadow-red-martial/20 transition-all active:scale-95 flex gap-3">
                    <LogIn className="h-6 w-6" />
                    Accès Membres
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-16 px-10 rounded-2xl border-2 border-navy/10 bg-white/50 backdrop-blur-sm text-navy hover:bg-navy hover:text-white font-bold text-lg transition-all active:scale-95 flex gap-3">
                    <LayoutDashboard className="h-6 w-6" />
                    Explorer
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </main>

      <footer className="absolute bottom-8 text-slate-400 text-xs font-black tracking-[0.3em] uppercase">
        © {currentYear} Vovinam Viet Vo Dao UGB SC
      </footer>
    </div>
  );
};

export default Index;
