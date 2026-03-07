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
        const user = response.user;
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        toast({
          title: "Connexion réussie !",
          description: `Bienvenue ${user.name}`,
        });
        
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-beige via-white to-beige-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-foret rounded-full flex items-center justify-center">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foret-dark">ABRISIA PLAN</h2>
          <p className="mt-2 text-pierre">Espace Équipe</p>
        </div>

        <Card className="shadow-2xl border-beige-dark" data-testid="login-card">
          <CardHeader className="bg-gradient-to-r from-beige to-beige-light border-b border-beige-dark">
            <CardTitle className="text-xl text-foret-dark text-center flex items-center justify-center">
              <Lock className="w-5 h-5 mr-2" />
              Connexion
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-fjord-dark font-medium">
                  Adresse courriel
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pierre h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    data-testid="login-email-input"
                    value={credentials.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10 border-beige-dark focus:border-foret"
                    placeholder="Votre adresse courriel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-fjord-dark font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pierre h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    data-testid="login-password-input"
                    value={credentials.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10 border-beige-dark focus:border-foret"
                    placeholder="Votre mot de passe"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                data-testid="login-submit-button"
                className="w-full bg-foret hover:bg-bois text-white py-3 text-lg font-semibold rounded-lg transition-all duration-300"
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

            <p className="text-center text-sm text-pierre mt-4">
              Administrateurs et employés
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-pierre hover:text-foret"
            data-testid="back-to-site-button"
          >
            ← Retour au site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
