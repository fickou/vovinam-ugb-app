import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import vovinamLogo from '@/assets/logo.png';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères'),
});

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères'),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      toast({
        title: 'Erreur de validation',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      let message = 'Erreur de connexion';
      if (error.message.includes('Invalid credentials')) {
        message = 'Email ou mot de passe incorrect';
      }
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signupSchema.safeParse({
      email: signupEmail,
      password: signupPassword,
      firstName,
      lastName,
    });

    if (!result.success) {
      toast({
        title: 'Erreur de validation',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, firstName, lastName);
    setIsLoading(false);

    if (error) {
      let message = 'Erreur lors de l\'inscription';
      if (error.message.includes('already exists') || error.message.includes('Duplicate entry')) {
        message = 'Cet email est déjà utilisé';
      }
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès !',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-martial/5 rounded-full blur-3xl animate-pulse"></div>

      <div className="w-full max-w-[440px] z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-xl shadow-navy/5 mb-2 transform transition-transform hover:scale-105 duration-500">
            <img src={vovinamLogo} alt="Vovinam Logo" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tighter text-navy uppercase drop-shadow-sm">
            Vovinam <span className="text-red-martial">UGB</span>
          </h1>
          <p className="text-slate-500 font-medium sm:text-lg">Portail de gestion du club sportif</p>
        </div>

        <Card className="border-none shadow-2xl shadow-navy/10 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-1 h-16 bg-navy/5 p-2 rounded-none">
                <TabsTrigger
                  value="login"
                  className="rounded-[1.75rem] font-bold text-sm tracking-wide data-[state=active]:text-navy data-[state=active]:shadow-lg transition-all duration-300"
                >
                  CONNEXION
                </TabsTrigger>
              </TabsList>

              <div className="p-8 sm:p-10">
                <TabsContent value="login" className="mt-0 focus-visible:outline-none">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="login-email" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email professionnel</Label>
                      <div className="relative group">
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="votre@email.com"
                          required
                          className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-navy focus:border-navy transition-all duration-300 font-medium placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center ml-1">
                        <Label htmlFor="login-password" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Mot de passe</Label>
                        <button type="button" className="text-[10px] font-bold text-navy-light hover:text-navy transition-colors whitespace-nowrap">OUBLIÉ ?</button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-navy focus:border-navy transition-all duration-300 font-medium placeholder:text-slate-300"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-14 rounded-2xl bg-navy hover:bg-black text-white font-bold text-base tracking-[0.1em] transition-all duration-500 shadow-xl shadow-navy/20 active:scale-[0.98] group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>AUTHENTIFICATION...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          ACCÉDER AU TABLEAU <span className="text-white/50 group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0 focus-visible:outline-none">
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2.5">
                        <Label htmlFor="firstName" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Prénom</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ex: Jean"
                          required
                          className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-red-martial focus:border-red-martial transition-all duration-300 font-medium"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <Label htmlFor="lastName" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nom</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ex: Dupont"
                          required
                          className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-red-martial focus:border-red-martial transition-all duration-300 font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="signup-email" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-red-martial focus:border-red-martial transition-all duration-300 font-medium"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="signup-password" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mot de passe</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-red-martial focus:border-red-martial transition-all duration-300 font-medium"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-14 rounded-2xl bg-red-martial hover:bg-black text-white font-bold text-base tracking-[0.1em] transition-all duration-500 shadow-xl shadow-red-martial/20 active:scale-[0.98] group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>CRÉATION...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          CRÉER MON COMPTE <span className="text-white/50 group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-xs font-bold tracking-widest uppercase pb-8 sm:pb-0">
          © {new Date().getFullYear()} Vovinam UGB • Excellence & Tradition
        </p>
      </div>
    </div>
  );
}
