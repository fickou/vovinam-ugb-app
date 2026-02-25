import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden text-center">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-martial/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="max-w-md z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <h1 className="text-[12rem] font-display font-black leading-none text-navy/5 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center translate-y-4">
            <Compass className="h-32 w-32 text-navy-light opacity-20 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-display font-black text-navy uppercase tracking-tight">
            Hors de combat !
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            La page <code className="bg-navy/5 px-2 py-0.5 rounded text-navy-light text-sm font-mono">{location.pathname}</code> semble avoir disparu dans un nuage de fumée...
          </p>
        </div>

        <Link to="/" className="inline-block transform transition-transform hover:scale-105 active:scale-95 duration-200">
          <Button size="lg" className="h-16 px-10 rounded-2xl bg-navy hover:bg-black text-white font-bold text-lg shadow-xl shadow-navy/20 flex gap-3">
            <Home className="h-6 w-6" />
            Retour à l'académie
          </Button>
        </Link>

        <p className="text-slate-400 text-[10px] font-black tracking-[0.4em] uppercase pt-12">
          Vovinam UGB • Excellence & Tradition
        </p>
      </div>
    </div>
  );
};

export default NotFound;
