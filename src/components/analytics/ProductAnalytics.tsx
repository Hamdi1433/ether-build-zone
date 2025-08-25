
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Projet, Contrat } from '../../lib/types';

interface ProductAnalyticsProps {
  projets: Projet[];
  contrats: Contrat[];
}

export function ProductAnalytics({ projets = [], contrats = [] }: ProductAnalyticsProps) {
  const [dateRange, setDateRange] = useState('all');

  const productAnalytics = useMemo(() => {
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

    // Performance par produit
    const productPerformance: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
      const produit = contrat.contrat_produit || 'Non spécifié';
      if (!productPerformance[produit]) {
        productPerformance[produit] = {
          contrats: 0,
          primeTotal: 0,
          commissionTotal: 0,
          primeMoyenne: 0
        };
      }
      
      productPerformance[produit].contrats++;
      productPerformance[produit].primeTotal += contrat.prime_brute_annuelle || 0;
      productPerformance[produit].commissionTotal += contrat.commissionnement_annee1 || 0;
    });

    // Calculer la prime moyenne
    Object.keys(productPerformance).forEach(produit => {
      const data = productPerformance[produit];
      data.primeMoyenne = data.contrats > 0 ? data.primeTotal / data.contrats : 0;
    });

    const topProduits = Object.entries(productPerformance)
      .map(([nom, data]: [string, any]) => ({ nom, ...data }))
      .sort((a, b) => b.primeTotal - a.primeTotal);

    // Performance par compagnie
    const companyPerformance: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
        const compagnie = contrat.contrat_compagnie || 'Non spécifiée';
        if(!companyPerformance[compagnie]) {
            companyPerformance[compagnie] = {
                contrats: 0,
                primeTotal: 0,
                marketShare: 0
            }
        }
        companyPerformance[compagnie].contrats++;
        companyPerformance[compagnie].primeTotal += contrat.prime_brute_annuelle || 0;
    });

    const totalCA = Object.values(companyPerformance).reduce((sum: number, comp: any) => sum + comp.primeTotal, 0);
    
    // Calculer les parts de marché
    Object.keys(companyPerformance).forEach(compagnie => {
      companyPerformance[compagnie].marketShare = totalCA > 0 ? 
        (companyPerformance[compagnie].primeTotal / totalCA) * 100 : 0;
    });

    const topCompanies = Object.entries(companyPerformance)
        .map(([nom, data]: [string, any]) => ({ nom, ...data}))
        .sort((a,b) => b.primeTotal - a.primeTotal);

    // Évolution temporelle par produit
    const monthlyProductData: { [key: string]: any } = {};
    filteredContrats.forEach(contrat => {
      if (contrat.contrat_date_creation) {
        const date = new Date(contrat.contrat_date_creation);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const produit = contrat.contrat_produit || 'Non spécifié';
        
        if (!monthlyProductData[monthKey]) {
          monthlyProductData[monthKey] = { month: monthKey };
        }
        
        if (!monthlyProductData[monthKey][produit]) {
          monthlyProductData[monthKey][produit] = 0;
        }
        
        monthlyProductData[monthKey][produit] += contrat.prime_brute_annuelle || 0;
      }
    });

    const monthlyEvolution = Object.values(monthlyProductData).sort((a: any, b: any) => a.month.localeCompare(b.month));

    return {
      topProduits,
      topCompanies,
      monthlyEvolution,
      totalContrats: filteredContrats.length,
      totalCA
    };
  }, [contrats, dateRange]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analyse Produits & Compagnies</h2>
          <p className="text-muted-foreground">Performance par produit et compagnie</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Produits Vendus</p>
            <p className="text-2xl font-bold text-foreground">{productAnalytics.topProduits.length}</p>
          </CardContent>
        </Card>
        
        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Compagnies Partenaires</p>
            <p className="text-2xl font-bold text-foreground">{productAnalytics.topCompanies.length}</p>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">CA Total Produits</p>
            <p className="text-2xl font-bold text-foreground">€{productAnalytics.totalCA.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Top Produits par Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productAnalytics.topProduits.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nom" type="category" width={100} />
                <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
                <Bar dataKey="primeTotal" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Répartition par Compagnie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productAnalytics.topCompanies.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="primeTotal"
                  nameKey="nom"
                  label={({nom, marketShare}) => `${nom}: ${marketShare.toFixed(1)}%`}
                >
                  {productAnalytics.topCompanies.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Performance Détaillée par Produit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productAnalytics.topProduits.map((produit, index) => (
              <div key={produit.nom} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{produit.nom}</h4>
                    <p className="text-sm text-muted-foreground">{produit.contrats} contrats vendus</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">€{produit.primeTotal.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    Moy: €{produit.primeMoyenne.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Com: €{produit.commissionTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {productAnalytics.monthlyEvolution.length > 1 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Évolution Mensuelle par Produit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={productAnalytics.monthlyEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `€${Number(value).toLocaleString()}`} />
                {productAnalytics.topProduits.slice(0, 5).map((produit, index) => (
                  <Line
                    key={produit.nom}
                    type="monotone"
                    dataKey={produit.nom}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    name={produit.nom}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
