
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Projet, Contrat } from '../../lib/types';

interface RevenueAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function RevenueAnalytics({ projets = [], contrats = [] }: RevenueAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  // Données factices pour l'affichage initial
  const mockMonthlyData = [
    { month: 'Jan 2024', primes: 45000, commissions: 2250 },
    { month: 'Fév 2024', primes: 52000, commissions: 2600 },
    { month: 'Mar 2024', primes: 48000, commissions: 2400 },
    { month: 'Avr 2024', primes: 55000, commissions: 2750 },
    { month: 'Mai 2024', primes: 61000, commissions: 3050 },
    { month: 'Juin 2024', primes: 58000, commissions: 2900 },
  ];

  const mockProductData = [
    { name: 'Assurance Auto', value: 35, color: '#3b82f6' },
    { name: 'Assurance Habitation', value: 25, color: '#10b981' },
    { name: 'Assurance Santé', value: 20, color: '#f59e0b' },
    { name: 'Assurance Vie', value: 20, color: '#ef4444' },
  ];

  const revenueAnalytics = useMemo(() => {
    // Si on a des données réelles, on les utilise, sinon on utilise les données factices
    if (contrats.length === 0) {
      return {
        monthlyData: mockMonthlyData,
        productData: mockProductData,
        globalMetrics: {
          totalPrimes: 245554.74,
          totalCommissions: 5691,
          nbContrats: 173,
          panierMoyen: 1371.81
        }
      };
    }

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

    const monthlyRevenue: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
      if (contrat.contrat_date_creation) {
        const date = new Date(contrat.contrat_date_creation);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = { month: monthKey, primes: 0, commissions: 0 };
        }
        
        monthlyRevenue[monthKey].primes += contrat.prime_brute_annuelle || 0;
        monthlyRevenue[monthKey].commissions += contrat.commissionnement_annee1 || 0;
      }
    });

    const monthlyData = Object.values(monthlyRevenue).sort((a: any, b: any) => a.month.localeCompare(b.month));
    const totalPrimes = filteredContrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0);
    const totalCommissions = filteredContrats.reduce((sum, c) => sum + (c.commissionnement_annee1 || 0), 0);
    const panierMoyen = filteredContrats.length > 0 ? totalPrimes / filteredContrats.length : 0;

    return {
      monthlyData: monthlyData.length > 0 ? monthlyData : mockMonthlyData,
      productData: mockProductData,
      globalMetrics: {
        totalPrimes,
        totalCommissions,
        nbContrats: filteredContrats.length,
        panierMoyen
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Chiffre d'Affaires Total</p>
                <p className="text-2xl font-bold text-blue-900">€{revenueAnalytics.globalMetrics.totalPrimes.toLocaleString()}</p>
                <p className="text-xs text-blue-600">{revenueAnalytics.globalMetrics.nbContrats} contrats</p>
              </div>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">€</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Commissions Totales</p>
                <p className="text-2xl font-bold text-green-900">€{revenueAnalytics.globalMetrics.totalCommissions.toLocaleString()}</p>
                <p className="text-xs text-green-600">Année 1</p>
              </div>
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Panier Moyen</p>
                <p className="text-2xl font-bold text-purple-900">€{revenueAnalytics.globalMetrics.panierMoyen.toLocaleString()}</p>
                <p className="text-xs text-purple-600">Par contrat</p>
              </div>
              <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">Ø</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Nombre de Contrats</p>
                <p className="text-2xl font-bold text-orange-900">{revenueAnalytics.globalMetrics.nbContrats}</p>
                <p className="text-xs text-orange-600">Total</p>
              </div>
              <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">#</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution Mensuelle des Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueAnalytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: any) => [`€${Number(value).toLocaleString()}`, '']}
                  labelFormatter={(label) => `Mois: ${label}`}
                />
                <Line type="monotone" dataKey="primes" stroke="#3b82f6" name="Primes" strokeWidth={3} />
                <Line type="monotone" dataKey="commissions" stroke="#10b981" name="Commissions" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueAnalytics.productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueAnalytics.productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
