
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Projet, Contrat } from '../../lib/types';

interface RevenueAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function RevenueAnalytics({ projets = [], contrats = [] }: RevenueAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  const revenueAnalytics = useMemo(() => {
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

    const filteredContrats = contrats.filter(c => dateFilter(c.contrat_date_creation));

    // Revenus par commercial
    const revenueByCommercial: { [key: string]: any } = {};
    
    filteredContrats.forEach(contrat => {
      const projet = projets.find(p => p.projet_id === contrat.projet_id);
      const commercial = projet?.commercial || 'Non attribué';

      if (!revenueByCommercial[commercial]) {
        revenueByCommercial[commercial] = {
          contrats: 0,
          primeTotal: 0,
          commissionAnnee1: 0,
        };
      }
      
      revenueByCommercial[commercial].contrats++;
      revenueByCommercial[commercial].primeTotal += contrat.prime_brute_annuelle || 0;
      revenueByCommercial[commercial].commissionAnnee1 += contrat.commissionnement_annee1 || 0;
    });

    // Évolution mensuelle
    const monthlyRevenue: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
      if (contrat.contrat_date_creation) {
        const date = new Date(contrat.contrat_date_creation);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = { 
            month: monthKey, 
            primes: 0, 
            commissions: 0,
            contrats: 0
          };
        }
        
        monthlyRevenue[monthKey].primes += contrat.prime_brute_annuelle || 0;
        monthlyRevenue[monthKey].commissions += contrat.commissionnement_annee1 || 0;
        monthlyRevenue[monthKey].contrats += 1;
      }
    });

    const monthlyData = Object.values(monthlyRevenue)
      .sort((a: any, b: any) => a.month.localeCompare(b.month));

    const totalPrimes = filteredContrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0);
    const totalCommissions = filteredContrats.reduce((sum, c) => sum + (c.commissionnement_annee1 || 0), 0);
    const avgContractValue = filteredContrats.length > 0 ? totalPrimes / filteredContrats.length : 0;

    return {
      revenueByCommercial: Object.entries(revenueByCommercial).map(([nom, data]: [string, any]) => ({ nom, ...data }))
        .sort((a, b) => b.commissionAnnee1 - a.commissionAnnee1),
      monthlyData,
      globalMetrics: {
        totalPrimes,
        totalCommissions,
        nbContrats: filteredContrats.length,
        avgContractValue,
        growthRate: monthlyData.length > 1 ? 
          (((monthlyData[monthlyData.length - 1] as any).primes - (monthlyData[monthlyData.length - 2] as any).primes) / (monthlyData[monthlyData.length - 2] as any).primes) * 100 : 0
      }
    };
  }, [contrats, projets, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analyse des Revenus</h2>
          <p className="text-muted-foreground">Primes et commissions sur la période sélectionnée</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-foreground">€{revenueAnalytics.globalMetrics.totalPrimes.toLocaleString()}</p>
              </div>
              <Badge variant={revenueAnalytics.globalMetrics.growthRate >= 0 ? "default" : "destructive"}>
                {revenueAnalytics.globalMetrics.growthRate >= 0 ? '+' : ''}{revenueAnalytics.globalMetrics.growthRate.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
            <p className="text-2xl font-bold text-foreground">€{revenueAnalytics.globalMetrics.totalCommissions.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Nombre de Contrats</p>
            <p className="text-2xl font-bold text-foreground">{revenueAnalytics.globalMetrics.nbContrats}</p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Valeur Moyenne</p>
            <p className="text-2xl font-bold text-foreground">€{revenueAnalytics.globalMetrics.avgContractValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Évolution Mensuelle des Revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={revenueAnalytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `€${Number(value).toLocaleString()}`, 
                  name === 'primes' ? 'Primes' : name === 'commissions' ? 'Commissions' : name
                ]} 
              />
              <Area 
                type="monotone" 
                dataKey="primes" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Primes" 
              />
              <Area 
                type="monotone" 
                dataKey="commissions" 
                stackId="2"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
                name="Commissions" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Performance par Commercial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueAnalytics.revenueByCommercial.map((commercial, index) => (
              <div key={commercial.nom} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{commercial.nom}</h4>
                    <p className="text-sm text-muted-foreground">{commercial.contrats} contrats</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">€{commercial.commissionAnnee1.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">CA: €{commercial.primeTotal.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
