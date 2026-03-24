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
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-10 bg-gradient-to-b from-navy to-navy/90">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-martial/5 rounded-full blur-3xl" />
      </div>


      <Card className="w-full max-w-sm relative z-10 shadow-2xl shadow-black/50">
        {/* Logo */}
        <CardHeader className="pb-4 sm:pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-xl border flex items-center">
              <img src={vovinamLogo} alt="Vovinam Logo" className="object-contain" />
            </div>
          </div>

          <CardTitle className="text-center text-xl sm:text-2xl">Vovinam UGB SC</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">Connexion à votre espace</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Responsive Tabs */}
          <Tabs 
            defaultValue="login" 
            className="w-full"
            onValueChange={() => {
              /* Reset form on tab change */
              setLoginEmail('');
              setLoginPassword('');
              setSignupEmail('');
              setSignupPassword('');
              setFirstName('');
              setLastName('');
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 h-10">
              <TabsTrigger value="login" className="text-xs sm:text-sm">Connexion</TabsTrigger>
              <TabsTrigger value="signup" className="text-xs sm:text-sm">Inscription</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-xs sm:text-sm">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-10 sm:h-11"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-xs sm:text-sm">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-10 sm:h-11"
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-10 sm:h-11 bg-navy hover:bg-navy-light text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connexion...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* SIGNUP TAB */}
            <TabsContent value="signup" className="space-y-3">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-xs sm:text-sm">Prénom</Label>
                    <Input
                      id="first-name"
                      placeholder="Jean"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 sm:h-11 text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-xs sm:text-sm">Nom</Label>
                    <Input
                      id="last-name"
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-10 sm:h-11 text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-xs sm:text-sm">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="h-10 sm:h-11 text-sm"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-xs sm:text-sm">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="h-10 sm:h-11 text-sm"
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-10 sm:h-11 bg-navy hover:bg-navy-light text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Inscription...
                    </span>
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="fixed bottom-4 left-0 right-0 text-center text-slate-400 text-xs font-bold tracking-widest uppercase z-10">
        © {new Date().getFullYear()} Vovinam UGB • Excellence &amp; Tradition
      </p>
    </div>
  );
}
