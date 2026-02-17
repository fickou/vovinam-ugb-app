import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import vovinamLogo from '@/assets/logo.png';

const Index = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-light flex flex-col items-center justify-center p-4">
      <main className="text-center space-y-8 max-w-lg">
        <img 
          src={vovinamLogo} 
          alt="Logo VOVINAM VIET VO DAO UGB" 
          className="h-32 w-32 mx-auto object-contain"
        />
        
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
            VOVINAM VIET VO DAO
          </h1>
          <p className="text-xl text-white/80 font-display">
            UGB SPORTING CLUB
          </p>
        </header>
        
        <p className="text-white/70">
          Application de gestion du club sportif universitaire
        </p>
        
        <nav className="flex flex-col sm:flex-row gap-4 justify-center" aria-label="Navigation principale">
          {user ? (
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-red-martial hover:bg-red-martial-light">
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Tableau de bord
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto bg-red-martial hover:bg-red-martial-light">
                  <LogIn className="h-5 w-5 mr-2" />
                  Connexion
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Tableau de bord
                </Button>
              </Link>
            </>
          )}
        </nav>
      </main>
      
      <footer className="absolute bottom-4 text-white/50 text-sm">
        © {currentYear} VOVINAM VIET VO DAO UGB SC
      </footer>
    </div>
  );
};

export default Index;
