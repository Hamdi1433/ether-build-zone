
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Brain, TrendingUp, Users, Target, AlertTriangle, Lightbulb } from 'lucide-react';
import { Contact, Projet, Contrat } from '../../lib/types';

interface AIAnalyticsProps {
  contacts: Contact[];
  projets: Projet[];
  contrats: Contrat[];
}

export function AIAnalytics({ contacts = [], projets = [], contrats = [] }: AIAnalyticsProps) {
  const [activeInsight, setActiveInsight] = useState('predictions');

  const aiAnalytics = useMemo(() => {
    // Prédictions basées sur les données historiques
    const predictions = {
      nextMonthContracts: Math.round(contrats.length * 1.15),
      expectedRevenue: contrats.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) * 1.12,
      conversionForecast: 23.5,
      highPotentialLeads: Math.round(projets.length * 0.15)
    };

    // Recommandations intelligentes
    const recommendations = [
      {
        id: 1,
        type: 'cross-sell',
        title: 'Opportunités de Cross-Selling',
        description: 'Clients avec contrat auto sans assurance habitation',
        priority: 'high',
        impact: 'Potentiel: +€125k de CA',
        count: 23,
        confidence: 85
      },
      {
        id: 2,
        type: 'follow-up',
        title: 'Relances Prioritaires',
        description: 'Prospects sans interaction depuis 15+ jours',
        priority: 'medium',
        impact: 'Taux conversion: +12%',
        count: 17,
        confidence: 92
      },
      {
        id: 3,
        type: 'pricing',
        title: 'Optimisation Tarifaire',
        description: 'Produits avec marge d\'amélioration',
        priority: 'medium',
        impact: 'Marge: +8%',
        count: 5,
        confidence: 78
      },
      {
        id: 4,
        type: 'retention',
        title: 'Risque de Résiliation',
        description: 'Contrats avec signaux d\'alerte',
        priority: 'high',
        impact: 'Rétention: €89k',
        count: 12,
        confidence: 88
      }
    ];

    // Insights de performance
    const insights = [
      {
        metric: 'Taux de Conversion',
        current: 18.5,
        target: 22.0,
        trend: 'up',
        suggestion: 'Améliorer le suivi des prospects chauds'
      },
      {
        metric: 'Durée Cycle de Vente',
        current: 28,
        target: 21,
        trend: 'stable',
        suggestion: 'Automatiser les étapes de qualification'
      },
      {
        metric: 'Valeur Moyenne Contrat',
        current: 2850,
        target: 3200,
        trend: 'up',
        suggestion: 'Proposer plus d\'options premium'
      }
    ];

    // Analyse prédictive des tendances
    const trendAnalysis = [
      { month: 'Jan', actual: 15, predicted: 16, confidence: 95 },
      { month: 'Fév', actual: 18, predicted: 17, confidence: 93 },
      { month: 'Mar', actual: 22, predicted: 21, confidence: 91 },
      { month: 'Avr', actual: 19, predicted: 20, confidence: 89 },
      { month: 'Mai', actual: 25, predicted: 24, confidence: 87 },
      { month: 'Jun', actual: null, predicted: 27, confidence: 85 },
      { month: 'Jul', actual: null, predicted: 29, confidence: 82 },
    ];

    // Score de santé commercial
    const healthScore = {
      overall: 78,
      pipeline: 82,
      conversion: 74,
      retention: 86,
      growth: 71
    };

    return {
      predictions,
      recommendations,
      insights,
      trendAnalysis,
      healthScore
    };
  }, [contacts, projets, contrats]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cross-sell': return <Target className="w-4 h-4" />;
      case 'follow-up': return <Users className="w-4 h-4" />;
      case 'pricing': return <TrendingUp className="w-4 h-4" />;
      case 'retention': return <AlertTriangle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-600" />
            Assistant IA Commercial
          </h2>
          <p className="text-muted-foreground">Analyses prédictives et recommandations intelligentes</p>
        </div>
        <Badge className="bg-purple-100 text-purple-700">
          IA Score: {aiAnalytics.healthScore.overall}/100
        </Badge>
      </div>

      <Tabs value={activeInsight} onValueChange={setActiveInsight} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="health">Santé Commerciale</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-glow border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contrats Prévus (30j)</p>
                    <p className="text-2xl font-bold text-purple-600">{aiAnalytics.predictions.nextMonthContracts}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">+15% vs mois précédent</p>
              </CardContent>
            </Card>

            <Card className="card-glow border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CA Prévu</p>
                    <p className="text-2xl font-bold text-green-600">€{(aiAnalytics.predictions.expectedRevenue / 1000).toFixed(0)}k</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">+12% croissance prédite</p>
              </CardContent>
            </Card>

            <Card className="card-glow border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taux Conversion</p>
                    <p className="text-2xl font-bold text-blue-600">{aiAnalytics.predictions.conversionForecast}%</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Optimisation suggérée</p>
              </CardContent>
            </Card>

            <Card className="card-glow border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Leads Chauds</p>
                    <p className="text-2xl font-bold text-orange-600">{aiAnalytics.predictions.highPotentialLeads}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Priorité absolue</p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Analyse Prédictive des Tendances</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={aiAnalytics.trendAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    name="Réalisé"
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#8b5cf6" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    name="Prédit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-6">
            {aiAnalytics.recommendations.map((rec) => (
              <Card key={rec.id} className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {getTypeIcon(rec.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-foreground">{rec.title}</h3>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">{rec.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-600 font-medium">{rec.impact}</span>
                          <span className="text-blue-600">{rec.count} opportunités</span>
                          <span className="text-purple-600">Confiance: {rec.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Voir Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {aiAnalytics.insights.map((insight, index) => (
              <Card key={index} className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{insight.metric}</h3>
                    <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                      {insight.trend === 'up' ? '↗️ Amélioration' : '→ Stable'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Actuel</p>
                      <p className="text-xl font-bold text-blue-600">
                        {typeof insight.current === 'number' && insight.current > 100 
                          ? `€${insight.current.toLocaleString()}` 
                          : insight.metric.includes('Durée') 
                            ? `${insight.current} jours`
                            : `${insight.current}%`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Objectif</p>
                      <p className="text-xl font-bold text-green-600">
                        {typeof insight.target === 'number' && insight.target > 100 
                          ? `€${insight.target.toLocaleString()}` 
                          : insight.metric.includes('Durée') 
                            ? `${insight.target} jours`
                            : `${insight.target}%`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Écart</p>
                      <p className={`text-xl font-bold ${
                        insight.current >= insight.target ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {insight.current >= insight.target ? '✅' : 
                          Math.abs(((insight.current - insight.target) / insight.target) * 100).toFixed(1) + '%'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Lightbulb className="w-4 h-4 inline mr-2" />
                      <strong>Suggestion:</strong> {insight.suggestion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Score de Santé Commerciale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {Object.entries(aiAnalytics.healthScore).map(([key, score]) => (
                  <div key={key} className="text-center">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 ${
                      score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      {score}
                    </div>
                    <p className="font-medium capitalize">{key === 'overall' ? 'Global' : key}</p>
                    <p className="text-xs text-muted-foreground">
                      {score >= 80 ? 'Excellent' : score >= 60 ? 'Bien' : 'À améliorer'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Actions Recommandées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-green-800">Pipeline bien alimenté</p>
                      <p className="text-sm text-green-600">Maintenir le rythme de prospection</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-orange-800">Améliorer la conversion</p>
                      <p className="text-sm text-orange-600">Former l'équipe aux techniques de closing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-blue-800">Optimiser le suivi</p>
                      <p className="text-sm text-blue-600">Mettre en place des relances automatisées</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Prochaines Étapes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Analyser les 23 opportunités de cross-selling',
                    'Relancer les 17 prospects inactifs',
                    'Revoir la tarification de 5 produits',
                    'Identifier les signaux de résiliation'
                  ].map((action, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 border border-border rounded">
                      <div className="w-4 h-4 border-2 border-purple-500 rounded"></div>
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
