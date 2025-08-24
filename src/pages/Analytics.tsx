
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../../components/auth-provider';
import { supabase } from '../lib/supabase';
import { CommercialAnalytics } from '../components/CommercialAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { RefreshCw, Mail, Users, TrendingUp, BarChart3 } from 'lucide-react';
import type { Contact, Projet, Contrat, EmailTemplate, Segment, Campaign, Interaction } from '../../lib/types';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [dateRange, setDateRange] = useState('30d');
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

      const [contactsResult, projetsResult, contratsResult, templatesResult, segmentsResult, campaignsResult, interactionsResult] = await Promise.all([
        supabase.from('contacts').select('*'),
        supabase.from('projets').select('*'),
        supabase.from('contrats').select('*'),
        supabase.from('email_templates').select('*'),
        supabase.from('segments').select('*'),
        supabase.from('campaigns').select('*'),
        supabase.from('interactions').select('*')
      ]);

      if (contactsResult.data) setContacts(contactsResult.data);
      if (projetsResult.data) setProjets(projetsResult.data);
      if (contratsResult.data) setContrats(contratsResult.data);
      if (templatesResult.data) setEmailTemplates(templatesResult.data);
      if (segmentsResult.data) setSegments(segmentsResult.data);
      if (campaignsResult.data) setCampaigns(campaignsResult.data);
      if (interactionsResult.data) setInteractions(interactionsResult.data);

      // Calculer les statistiques d'email
      const emailInteractions = interactionsResult.data?.filter(i => i.canal === 'email') || [];
      const totalSent = emailInteractions.length;
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

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const monthlyEmailData = React.useMemo(() => {
    const today = new Date();
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthInteractions = interactions.filter(interaction => {
        if (!interaction.created_at) return false;
        const interactionDate = new Date(interaction.created_at);
        return interactionDate.getFullYear() === date.getFullYear() && 
               interactionDate.getMonth() === date.getMonth() &&
               interaction.canal === 'email';
      });

      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        envois: monthInteractions.length,
        ouvertures: monthInteractions.filter(i => i.type === 'ouverture').length,
        clics: monthInteractions.filter(i => i.type === 'clic').length
      });
    }
    
    return months;
  }, [interactions]);

  const campaignPerformance = React.useMemo(() => {
    return campaigns.map(campaign => ({
      nom: campaign.nom,
      envois: campaign.tracking_stats?.envois || 0,
      ouvertures: campaign.tracking_stats?.ouvertures || 0,
      clics: campaign.tracking_stats?.clics || 0,
      tauxOuverture: campaign.tracking_stats?.envois > 0 ? 
        ((campaign.tracking_stats?.ouvertures || 0) / campaign.tracking_stats.envois) * 100 : 0
    }));
  }, [campaigns]);

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emails">Emails & Campagnes</TabsTrigger>
          <TabsTrigger value="commercial">Performance Commerciale</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Emails Envoyés</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{emailStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">+12% ce mois</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Campagnes Actives</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{campaigns.filter(c => c.statut === 'active').length}</p>
                <p className="text-xs text-muted-foreground">sur {campaigns.length} total</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Performance par Campagne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignPerformance.slice(0, 5).map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{campaign.nom}</h4>
                      <p className="text-sm text-muted-foreground">{campaign.envois} envois</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{campaign.tauxOuverture.toFixed(1)}% ouverture</Badge>
                      <p className="text-xs text-muted-foreground">{campaign.clics} clics</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-6">
          <CommercialAnalytics 
            contacts={contacts} 
            projets={projets} 
            contrats={contrats} 
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Section en développement...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité Générale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Section en développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
