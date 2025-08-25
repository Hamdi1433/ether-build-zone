
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Projet, Contrat } from '../../lib/types';

interface PipelineAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function PipelineAnalytics({ projets = [], contrats = [] }: PipelineAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  const pipelineAnalytics = useMemo(() => {
    const today = new Date();
    const dateFilter = (dateStr: string | undefined) => {
      if (dateRange === 'all') return true;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case '7d': return daysDiff <= 7;
        case '30d': return daysDiff <= 30;
        case '90d': return daysDiff <= 90;
        case '1y': return daysDiff <= 365;
        default: return true;
      }
    };

    const filteredProjets = projets.filter(p => dateFilter(p.date_creation));
    const filteredContrats = contrats.filter(c => dateFilter(c.contrat_date_creation));

    // Comptage par statut
    const statutCounts: { [key: string]: any } = {};
    filteredProjets.forEach(projet => {
      const statut = projet.statut || 'Non défini';
      statutCounts[statut] = (statutCounts[statut] || 0) + 1;
    });

    // Pipeline structuré
    const pipelineOrder = [
      'Nouveau',
      'Projet à traiter', 
      'Devis envoyé',
      'Contrat enregistré',
      'Perdu'
    ];

    const funnelData = pipelineOrder
      .map(statut => ({
        name: statut,
        value: statutCounts[statut] || 0,
        fill: getStatusColor(statut),
        percentage: filteredProjets.length > 0 ? ((statutCounts[statut] || 0) / filteredProjets.length) * 100 : 0
      }))
      .filter(item => item.value > 0);

    // Analyse par origine
    const origineStats: { [key: string]: number } = {};
    filteredProjets.forEach(projet => {
      const origine = projet.origine || 'Non spécifiée';
      origineStats[origine] = (origineStats[origine] || 0) + 1;
    });

    const origineData = Object.entries(origineStats)
      .map(([nom, count]) => ({ nom, count, percentage: (count / filteredProjets.length) * 100 }))
      .sort((a, b) => b.count - a.count);

    // Analyse par commercial
    const commercialStats: { [key: string]: any } = {};
    filteredProjets.forEach(projet => {
      const commercial = projet.commercial || 'Non attribué';
      if (!commercialStats[commercial]) {
        commercialStats[commercial] = {
          total: 0,
          nouveaux: 0,
          enCours: 0,
          signes: 0,
          perdus: 0,
          tauxConversion: 0
        };
      }
      
      commercialStats[commercial].total++;
      
      const statut = projet.statut || '';
      if (statut === 'Nouveau') commercialStats[commercial].nouveaux++;
      else if (statut.includes('traiter') || statut.includes('Devis')) commercialStats[commercial].enCours++;
      else if (statut === 'Contrat enregistré') commercialStats[commercial].signes++;
      else if (statut.includes('Perdu')) commercialStats[commercial].perdus++;
    });

    // Calculer taux de conversion
    Object.keys(commercialStats).forEach(commercial => {
      const stats = commercialStats[commercial];
      const contrats = filteredContrats.filter(c => {
        const projet = projets.find(p => p.projet_id === c.projet_id);
        return projet?.commercial === commercial;
      }).length;
      
      stats.signes = contrats;
      stats.tauxConversion = stats.total > 0 ? (contrats / stats.total) * 100 : 0;
    });

    const commercialData = Object.entries(commercialStats)
      .map(([nom, stats]: [string, any]) => ({ nom, ...stats }))
      .sort((a, b) => b.tauxConversion - a.tauxConversion);

    const totalProjets = filteredProjets.length;
    const projetsSignes = filteredContrats.length;
    const tauxConversion = totalProjets > 0 ? (projetsSignes / totalProjets) * 100 : 0;
    const projetsEnCours = statutCounts['Projet à traiter'] || 0;
    const devisEnvoyes = statutCounts['Devis envoyé'] || 0;

    return {
      funnelData,
      origineData,
      commercialData,
      totalProjets,
      projetsSignes,
      projetsEnCours,
      devisEnvoyes,
      tauxConversion,
      statutCounts
    };
  }, [projets, contrats, dateRange]);

  function getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Nouveau': '#3b82f6',
      'Projet à traiter': '#f59e0b',
      'Devis envoyé': '#8b5cf6',
      'Contrat enregistré': '#10b981',
      'Perdu': '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analyse du Pipeline Commercial</h2>
          <p className="text-muted-foreground">Suivi des opportunités et entonnoir de conversion</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Afficher tout</SelectItem>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">3 derniers mois</SelectItem>
            <SelectItem value="1y">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Projets</p>
            <p className="text-2xl font-bold text-foreground">{pipelineAnalytics.totalProjets}</p>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">En Cours</p>
            <p className="text-2xl font-bold text-orange-500">{pipelineAnalytics.projetsEnCours}</p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Contrats Signés</p>
            <p className="text-2xl font-bold text-green-600">{pipelineAnalytics.projetsSignes}</p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Taux de Conversion</p>
            <p className="text-2xl font-bold text-foreground">{pipelineAnalytics.tauxConversion.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Entonnoir de Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value} projets (${((value / pipelineAnalytics.totalProjets) * 100).toFixed(1)}%)`,
                    name
                  ]}
                />
                <Funnel
                  dataKey="value"
                  data={pipelineAnalytics.funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Répartition par Origine</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineAnalytics.origineData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="nom"
                  label={({nom, percentage}) => `${nom}: ${percentage.toFixed(1)}%`}
                >
                  {pipelineAnalytics.origineData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Performance par Commercial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineAnalytics.commercialData.map((commercial, index) => (
              <div key={commercial.nom} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index < 3 ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-foreground">{commercial.nom}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{commercial.tauxConversion.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">taux conversion</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-blue-600">{commercial.total}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-600">{commercial.nouveaux}</div>
                    <div className="text-muted-foreground">Nouveaux</div>
                  </div>
                  <div>
                    <div className="font-bold text-orange-600">{commercial.enCours}</div>
                    <div className="text-muted-foreground">En cours</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">{commercial.signes}</div>
                    <div className="text-muted-foreground">Signés</div>
                  </div>
                  <div>
                    <div className="font-bold text-red-600">{commercial.perdus}</div>
                    <div className="text-muted-foreground">Perdus</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Répartition des Statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineAnalytics.funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
