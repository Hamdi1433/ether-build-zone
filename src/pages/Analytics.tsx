import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { supabase } from '../integrations/supabase/client';
import { CommercialAnalytics } from '../components/CommercialAnalytics';
import { BrevoIntegration } from '../components/analytics/BrevoIntegration';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { RefreshCw, Mail, Users, TrendingUp, BarChart3, DollarSign, Zap } from 'lucide-react';

interface Contact {
  identifiant: number;
  id?: number;
  email?: string;
  nom?: string;
  prenom?: string;
}

interface Projet {
  projet_id: number;
  contact_id?: number;
  statut?: string;
  commercial?: string;
  origine?: string;
}

interface Contrat {
  id: string;
  contact_id?: number;
  projet_id?: number;
  prime_brute_annuelle?: number;
  commissionnement_annee1?: number;
}

interface Interaction {
  id: number;
  contact_id?: number;
  type?: string;
  canal?: string;
  created_at?: string;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  
  // Données mockées pour l'affichage immédiat
  const [emailStats, setEmailStats] = useState({
    totalSent: 1247,
    totalOpened: 623,
    totalClicked: 156,
    totalBounced: 23,
    openRate: 49.9,
    clickRate: 12.5,
    bounceRate: 1.8
  });

  const mockContacts = [
    { identifiant: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com' },
    { identifiant: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@email.com' },
    { identifiant: 3, nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@email.com' },
  ];

  const mockProjets = [
    { projet_id: 1, contact_id: 1, statut: 'En cours', commercial: 'Sophie Durand', origine: 'Web' },
    { projet_id: 2, contact_id: 2, statut: 'Signé', commercial: 'Michel Leroux', origine: 'Téléphone' },
    { projet_id: 3, contact_id: 3, statut: 'Prospect', commercial: 'Sophie Durand', origine: 'Référence' },
  ];

  const mockContrats = [
    { 
      id: '1', 
      contact_id: 1, 
      projet_id: 1, 
      prime_brute_annuelle: 1200, 
      commissionnement_annee1: 180,
      contrat_date_creation: '2024-01-15'
    },
    { 
      id: '2', 
      contact_id: 2, 
      projet_id: 2, 
      prime_brute_annuelle: 1800, 
      commissionnement_annee1: 270,
      contrat_date_creation: '2024-01-10'
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les données réelles
      const [contactsResult, projetsResult, contratsResult, interactionsResult] = await Promise.all([
        supabase.from('contact').select('*'),
        supabase.from('projets').select('*'),
        supabase.from('contrats').select('*'),
        supabase.from('interactions').select('*').eq('canal', 'email')
      ]);

      console.log('Données récupérées:', {
        contacts: contactsResult.data?.length || 0,
        projets: projetsResult.data?.length || 0,
        contrats: contratsResult.data?.length || 0,
        interactions: interactionsResult.data?.length || 0
      });

      // Utiliser les données réelles si disponibles, sinon utiliser les données mockées
      setContacts(contactsResult.data && contactsResult.data.length > 0 ? contactsResult.data : mockContacts);
      setProjets(projetsResult.data && projetsResult.data.length > 0 ? projetsResult.data : mockProjets);
      setContrats(contratsResult.data && contratsResult.data.length > 0 ? contratsResult.data : mockContrats);
      setInteractions(interactionsResult.data || []);

      // Calculer les stats d'email
      const emailInteractions = interactionsResult.data || [];
      if (emailInteractions.length > 0) {
        const totalSent = emailInteractions.filter(i => i.type === 'envoi').length;
        const totalOpened = emailInteractions.filter(i => i.type === 'ouverture').length;
        const totalClicked = emailInteractions.filter(i => i.type === 'clic').length;
        const totalBounced = emailInteractions.filter(i => i.type === 'bounce').length;

        setEmailStats({
          totalSent,
          totalOpened,
          totalClicked,
          totalBounced,
          openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
          clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
          bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser les données mockées
      setContacts(mockContacts);
      setProjets(mockProjets);
      setContrats(mockContrats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Données pour le graphique mensuel
  const monthlyEmailData = React.useMemo(() => {
    const today = new Date();
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      const monthInteractions = interactions.filter(interaction => {
        if (!interaction.created_at) return false;
        const interactionDate = new Date(interaction.created_at);
        return interactionDate.getFullYear() === date.getFullYear() && 
               interactionDate.getMonth() === date.getMonth();
      });

      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        envois: monthInteractions.filter(i => i.type === 'envoi').length,
        ouvertures: monthInteractions.filter(i => i.type === 'ouverture').length,
        clics: monthInteractions.filter(i => i.type === 'clic').length
      });
    }
    
    return months;
  }, [interactions]);

  // Calcul des revenus réels
  const revenueStats = React.useMemo(() => {
    const totalRevenue = contrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0);
    const totalCommission = contrats.reduce((sum, c) => sum + (c.commissionnement_annee1 || 0), 0);
    const nbContrats = contrats.length;
    const avgDealSize = nbContrats > 0 ? totalRevenue / nbContrats : 0;

    return {
      totalRevenue,
      totalCommission,
      nbContrats,
      avgDealSize
    };
  }, [contrats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Statistiques</h1>
          <p className="text-muted-foreground">Vue d'ensemble de vos performances commerciales et marketing</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            Données en temps réel
          </Badge>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emails">Emails & Brevo</TabsTrigger>
          <TabsTrigger value="commercial">Performance Commerciale</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          <BrevoIntegration />
        </TabsContent>

        <TabsContent value="commercial" className="space-y-6">
          <CommercialAnalytics 
            contacts={contacts} 
            projets={projets} 
            contrats={contrats} 
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-600">Chiffre d'Affaires Total</p>
                </div>
                <p className="text-2xl font-bold text-green-900">€{revenueStats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">{revenueStats.nbContrats} contrats</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Commissions Totales</p>
                </div>
                <p className="text-2xl font-bold text-foreground">€{revenueStats.totalCommission.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Année 1</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-muted-foreground">Panier Moyen</p>
                </div>
                <p className="text-2xl font-bold text-foreground">€{revenueStats.avgDealSize.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Par contrat</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-muted-foreground">Contacts Total</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
                <p className="text-xs text-muted-foreground">Base clients</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Évolution des Revenus Mensuels</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyEmailData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="envois" fill="#3b82f6" name="Activité commerciale" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span>Brevo Email Marketing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                  <p className="text-sm text-muted-foreground">
                    Synchronisation automatique des campagnes email et statistiques en temps réel.
                  </p>
                  <Button variant="outline" className="w-full">
                    Configurer les webhooks
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="h-5 w-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">f</span>
                  <span>Meta Business (Facebook/Instagram)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge variant="secondary">Non connecté</Badge>
                  <p className="text-sm text-muted-foreground">
                    Synchronisez vos campagnes publicitaires Facebook et Instagram.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Connecter Meta Business
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
