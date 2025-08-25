
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { CRMStats } from '../lib/types'

export function DashboardTab() {
  const [stats, setStats] = useState<CRMStats>({
    totalContacts: 0,
    activeClients: 0,
    prospects: 0,
    totalRevenue: 0,
    conversionRate: "0%",
    avgRevenuePerClient: "0€",
    growthRate: "0%",
    activeCampaigns: 0,
    crossSellOpportunities: 0,
    aiScore: 85,
    monthlyGrowth: 0,
    churnRate: 0,
    customerLifetimeValue: 0,
    acquisitionCost: 0,
    pipelineValue: 0,
    forecastAccuracy: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [
        { data: contacts },
        { data: contrats },
        { data: projets }
      ] = await Promise.all([
        supabase.from('contact').select('*'),
        supabase.from('contrats').select('*'),
        supabase.from('projets').select('*')
      ])

      const totalContacts = contacts?.length || 0
      const activeClients = contrats?.length || 0
      const prospects = projets?.filter(p => p.statut === 'prospect')?.length || 0
      const totalRevenue = contrats?.reduce((sum, c) => sum + (c.prime_brute_annuelle || 0), 0) || 0

      setStats({
        totalContacts,
        activeClients,
        prospects,
        totalRevenue,
        conversionRate: totalContacts > 0 ? `${Math.round((activeClients / totalContacts) * 100)}%` : "0%",
        avgRevenuePerClient: activeClients > 0 ? `${Math.round(totalRevenue / activeClients)}€` : "0€",
        growthRate: "+12%",
        activeCampaigns: 5,
        crossSellOpportunities: Math.floor(activeClients * 0.3),
        aiScore: 85,
        monthlyGrowth: 12,
        churnRate: 2.5,
        customerLifetimeValue: totalRevenue > 0 ? totalRevenue / activeClients * 5 : 0,
        acquisitionCost: 250,
        pipelineValue: prospects * 1500,
        forecastAccuracy: 87.5
      })
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement des statistiques...</div>
  }

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyGrowth}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}€</div>
            <p className="text-xs text-muted-foreground">
              {stats.growthRate} par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}</div>
            <p className="text-xs text-muted-foreground">
              Objectif: 15%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-selling</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.crossSellOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              Opportunités détectées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Actions Prioritaires
            </CardTitle>
            <CardDescription>
              Tâches nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">12 relances urgentes</p>
                  <p className="text-sm text-red-600">Prospects sans contact depuis 7+ jours</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Voir</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-900">8 RDV à programmer</p>
                  <p className="text-sm text-orange-600">Prospects qualifiés en attente</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Planifier</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">25 opportunités cross-sell</p>
                  <p className="text-sm text-green-600">Clients éligibles produits complémentaires</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Exploiter</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Campagnes Actives
            </CardTitle>
            <CardDescription>
              Performance des campagnes en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Relance Mutuelle Santé</span>
                <Badge variant="default">Actif</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Taux d'ouverture: 24.5% • Clics: 4.2%
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Cross-sell Auto/Habitat</span>
                <Badge variant="secondary">Programmé</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Lancement: Demain 09:00
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Réactivation Prospects</span>
                <Badge variant="outline">Terminé</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Conversion: 8.5% • ROI: +340%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
