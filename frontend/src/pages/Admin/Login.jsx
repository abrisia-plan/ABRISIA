import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, User, Home as HomeIcon } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { authService, handleApiError } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        toast({
          title: "Connexion réussie !",
          description: `Bienvenue ${response.user.name}`,
        });
        
        navigate('/admin/dashboard');
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-teal-800 rounded-full flex items-center justify-center">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">ABRISIA PLAN</h2>
          <p className="mt-2 text-slate-600">Espace Administrateur</p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-2xl border-stone-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-stone-50 border-b border-stone-200">
            <CardTitle className="text-xl text-slate-800 text-center flex items-center justify-center">
              <Lock className="w-5 h-5 mr-2" />
              Connexion
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Adresse email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10 border-stone-300 focus:border-teal-500"
                    placeholder="admin@abrisia-plan.ca"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10 border-stone-300 focus:border-teal-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Informations de test */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 font-medium mb-2">Connexion de test :</p>
              <p className="text-xs text-slate-500">Email: admin@abrisia-plan.ca</p>
              <p className="text-xs text-slate-500">Mot de passe: admin123</p>
            </div>
          </CardContent>
        </Card>

        {/* Lien de retour */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-teal-700"
          >
            ← Retour au site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;