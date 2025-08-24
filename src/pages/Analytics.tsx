
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { supabase } from '../integrations/supabase/client';
import { CommercialAnalytics } from '../components/CommercialAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { RefreshCw, Mail, Users, TrendingUp, BarChart3, DollarSign } from 'lucide-react';

interface Contact {
  identifiant: number;
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
  const [emailStats, setEmailStats] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer tous les données
      const [contactsResult, projetsResult, contratsResult, interactionsResult] = await Promise.all([
        supabase.from('contact').select('*'),
        supabase.from('projets').select('*'),
        supabase.from('contrats').select('*'),
        supabase.from('interactions').select('*').eq('canal', 'email')
      ]);

      console.log('Données récupérées:', {
        contacts: contactsResult.data?.length,
        projets: projetsResult.data?.length,
        contrats: contratsResult.data?.length,
        interactions: interactionsResult.data?.length
      });

      if (contactsResult.data) setContacts(contactsResult.data);
      if (projetsResult.data) setProjets(projetsResult.data);
      if (contratsResult.data) setContrats(contratsResult.data);
      if (interactionsResult.data) setInteractions(interactionsResult.data);

      // Calculer les statistiques d'email à partir des vraies données
      const emailInteractions = interactionsResult.data || [];
      const totalSent = emailInteractions.filter(i => i.type === 'envoi').length;
      const totalOpened = emailInteractions.filter(i => i.type === 'ouverture').length;
      const totalClicked = emailInteractions.filter(i => i.type === 'clic').length;
      const totalBounced = emailInteractions.filter(i => i.type === 'bounce').length;

      console.log('Stats emails calculées:', { totalSent, totalOpened, totalClicked, totalBounced });

      setEmailStats({
        totalSent,
        totalOpened,
        totalClicked,
        totalBounced,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
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
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emails">Emails & Campagnes</TabsTrigger>
          <TabsTrigger value="commercial">Performance Commerciale</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Emails Envoyés</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{emailStats.totalSent}</p>
                <p className="text-xs text-muted-foreground">Total des envois</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-muted-foreground">Taux d'Ouverture</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{emailStats.openRate.toFixed(1)}%</p>
                <Progress value={emailStats.openRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium text-muted-foreground">Taux de Clic</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{emailStats.clickRate.toFixed(1)}%</p>
                <Progress value={emailStats.clickRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-muted-foreground">Bounces</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{emailStats.totalBounced}</p>
                <p className="text-xs text-muted-foreground">{emailStats.bounceRate.toFixed(1)}% du total</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activité Email par Mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyEmailData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="envois" stroke="#3b82f6" name="Envois" strokeWidth={2} />
                  <Line type="monotone" dataKey="ouvertures" stroke="#10b981" name="Ouvertures" strokeWidth={2} />
                  <Line type="monotone" dataKey="clics" stroke="#f59e0b" name="Clics" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {emailStats.totalSent === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Aucune donnée email trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  Vérifiez que le webhook Brevo est correctement configuré et que des emails ont été envoyés.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-blue-900 mb-2">URL du webhook Brevo :</h4>
                  <code className="text-sm bg-white p-2 rounded border block">
                    https://wybhtprxiwgzmpmnfceq.supabase.co/functions/v1/brevo-webhook
                  </code>
                </div>
              </CardContent>
            </Card>
          )}
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-muted-foreground">Chiffre d'Affaires Total</p>
                </div>
                <p className="text-2xl font-bold text-foreground">€{revenueStats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{revenueStats.nbContrats} contrats</p>
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
      </Tabs>
    </div>
  );
}
