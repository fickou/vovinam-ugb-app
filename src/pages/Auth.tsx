import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [isInvite, setIsInvite] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const { signIn, signUp, user, isStaff } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Détecte le lien d'invitation Supabase (mode PKCE : query params, ou ancien mode : hash)
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const isHashInvite = hash.includes('type=invite') || hash.includes('type=recovery');
    // Le mode PKCE envoie un `code` dans les query params après échange
    const hasCode = params.get('code') !== null;

    if (isHashInvite || hasCode) {
      setIsInvite(true);
      // Supabase lit le token/code automatiquement depuis l'URL
      supabase.auth.exchangeCodeForSession(params.get('code') ?? '').catch(() => {
        // Si pas de code PKCE, getSession charge depuis le hash
        supabase.auth.getSession();
      });
    }
  }, []);

  useEffect(() => {
    if (user && !isInvite) {  
      if (isStaff) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard/profile');
      }
    }
  }, [user, navigate, isStaff, isInvite]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit faire au moins 6 caractères.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Mot de passe défini ✅', description: 'Bienvenue dans votre espace membre !' });
      setIsInvite(false);
      navigate('/dashboard/profile');
    }
  };

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
        title: 'Demande envoyée',
        description: 'Votre demande d\'inscription est en attente de validation par l\'administrateur.',
      });
    }
  };

  // Ecran affiché quand l'utilisateur clique le lien d'invitation
  if (isInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-gradient-to-b from-navy to-navy/90 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-martial/5 rounded-full blur-3xl" />
        </div>

        <Card className="w-full max-w-sm relative z-10 shadow-2xl shadow-black/50 border-white/10">
          <CardHeader className="pb-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center p-2">
                <img src={vovinamLogo} alt="Vovinam Logo" className="object-contain h-full w-full" />
              </div>
            </div>
            <div className="inline-flex items-center justify-center mx-auto gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <span>✅</span> Adhésion validée
            </div>
            <CardTitle className="text-xl sm:text-2xl">Bienvenue dans le club !</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Choisissez un mot de passe pour accéder à votre espace membre.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs sm:text-sm font-semibold">Mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs sm:text-sm font-semibold">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11"
                  minLength={6}
                  required
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400 -mt-1">⚠️ Les mots de passe ne correspondent pas</p>
              )}
              <Button
                type="submit"
                disabled={loading || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
                className="w-full h-11 bg-gradient-to-r from-navy to-navy-light hover:from-navy-light hover:to-navy text-sm font-bold mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enregistrement...
                  </span>
                ) : (
                  '🔑 Accéder à mon espace membre'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="fixed bottom-4 left-0 right-0 text-center text-slate-500 text-xs font-bold tracking-widest uppercase z-10">
          © {new Date().getFullYear()} Vovinam UGB • Excellence &amp; Tradition
        </p>
      </div>
    );
  }

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
                    "Effectuer une demande"
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
