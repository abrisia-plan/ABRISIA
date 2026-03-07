import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lock, Mail, ArrowLeft, Loader2 } from 'lucide-react';
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
        const user = response.user;
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        toast({
          title: "Connexion réussie !",
          description: `Bienvenue ${user.name}`,
        });
        
        if (user.role === 'admin') {
          navigate('/admin/panel');
        } else {
          localStorage.setItem('employeeToken', response.token);
          localStorage.setItem('employeeData', JSON.stringify(user));
          navigate('/espace-employe');
        }
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
    <div className="min-h-screen bg-stone-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-stone-200">
            <img 
              src="https://customer-assets.emergentagent.com/job_tiny-house-hub/artifacts/9faf0wxc_Screenshot_20250814-012530.png" 
              alt="Logo Abrisia" 
              className="w-full h-full object-cover scale-125"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">ABRISIA PLAN</h1>
          <p className="text-slate-500 text-sm mt-1">Espace équipe</p>
        </div>

        {/* Carte de connexion */}
        <Card className="shadow-lg border-stone-200" data-testid="login-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                  Adresse courriel
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    data-testid="login-email-input"
                    value={credentials.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10 h-11 border-stone-300 focus:border-teal-600 focus:ring-teal-600"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    data-testid="login-password-input"
                    value={credentials.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10 h-11 border-stone-300 focus:border-teal-600 focus:ring-teal-600"
                    placeholder="Votre mot de passe"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                data-testid="login-submit-button"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white h-11 text-base font-semibold rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-4">
              Administrateurs et employés uniquement
            </p>
          </CardContent>
        </Card>

        {/* Lien retour */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-teal-700 text-sm"
            data-testid="back-to-site-button"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour au site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
