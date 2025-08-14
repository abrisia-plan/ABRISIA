import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { UserPlus, Home as HomeIcon, User, Mail, Phone, Building } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const EmployeeRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    role: '',
    specialties: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const availableSpecialties = [
    'Plans architecturaux',
    'Plans de fondation',
    'Plans électriques',
    'Plans de plomberie',
    'Plans de ventilation',
    'Mini-maisons',
    'Chalets',
    'Maisons résidentielles',
    'Extensions',
    'Ébénisterie',
    'Construction générale',
    'Charpenterie',
    'Rénovation',
    'Gestion de projet'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSpecialtyChange = (specialty, checked) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked 
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre rôle",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulation API call (sera remplacé par vraie API)
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        company: formData.company,
        role: formData.role,
        specialties: formData.specialties
      };

      console.log('Inscription employé:', registrationData);

      // Simulation réussie
      setTimeout(() => {
        toast({
          title: "Inscription réussie !",
          description: "Votre demande a été envoyée. Vous recevrez un email de confirmation une fois votre compte approuvé par l'administrateur.",
        });
        
        // Redirection vers page de confirmation
        navigate('/employee/registration-pending');
      }, 1500);

    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-teal-800 rounded-full flex items-center justify-center">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">ABRISIA PLAN</h1>
          <p className="text-lg text-slate-600 mt-2">Rejoignez notre équipe</p>
        </div>

        {/* Formulaire d'inscription */}
        <Card className="shadow-2xl border-stone-200">
          <CardHeader className="bg-gradient-to-r from-stone-50 to-amber-50 border-b border-stone-200">
            <CardTitle className="text-2xl text-slate-800 text-center flex items-center justify-center">
              <UserPlus className="w-6 h-6 mr-3" />
              Inscription Employé
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-stone-200 pb-2">
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      Nom complet *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="pl-10 border-stone-300 focus:border-teal-500"
                        placeholder="Votre nom et prénom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Adresse email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="pl-10 border-stone-300 focus:border-teal-500"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">
                      Mot de passe *
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="border-stone-300 focus:border-teal-500"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                      Confirmer le mot de passe *
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="border-stone-300 focus:border-teal-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-stone-200 pb-2">
                  Informations professionnelles
                </h3>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Rôle souhaité *</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="border-stone-300 focus:border-teal-500">
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="designer">Dessinateur / Architecte</SelectItem>
                      <SelectItem value="constructor">Constructeur / Entrepreneur</SelectItem>
                      <SelectItem value="employee">Employé général</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-700 font-medium">
                      Téléphone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 border-stone-300 focus:border-teal-500"
                        placeholder="(514) 555-0123"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-700 font-medium">
                      Entreprise (optionnel)
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="pl-10 border-stone-300 focus:border-teal-500"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spécialités */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-stone-200 pb-2">
                  Vos spécialités
                </h3>
                <p className="text-sm text-slate-600">
                  Cochez toutes les compétences qui vous correspondent (au moins une)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableSpecialties.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-3 p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                      <Checkbox
                        id={`specialty-${specialty}`}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked)}
                        className="border-stone-400"
                      />
                      <Label 
                        htmlFor={`specialty-${specialty}`} 
                        className="cursor-pointer text-sm font-medium text-slate-700"
                      >
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soumission */}
              <div className="pt-6 border-t border-stone-200">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isLoading || !formData.role || formData.specialties.length === 0}
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-3 h-5 w-5" />
                      Rejoindre l'équipe Abrisia
                    </>
                  )}
                </Button>
                
                {(!formData.role || formData.specialties.length === 0) && (
                  <p className="text-center text-sm text-slate-500 mt-3">
                    Veuillez sélectionner un rôle et au moins une spécialité
                  </p>
                )}
              </div>
            </form>

            {/* Liens */}
            <div className="mt-8 text-center space-y-2">
              <p className="text-sm text-slate-600">
                Déjà inscrit ?{' '}
                <Link to="/employee/login" className="text-teal-700 hover:text-teal-800 font-medium">
                  Se connecter
                </Link>
              </p>
              <p className="text-sm text-slate-500">
                <Link to="/" className="text-slate-600 hover:text-teal-700">
                  ← Retour au site
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informations complémentaires */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Processus d'approbation
            </h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>1. Votre inscription sera examinée par notre équipe</p>
              <p>2. Vous recevrez un email de confirmation une fois approuvé</p>
              <p>3. Vous pourrez alors accéder à votre espace employé et vos projets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegister;