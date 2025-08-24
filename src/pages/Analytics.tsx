
import React, { useState, useEffect } from 'react'
import { useAuth } from '../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { CommercialAnalytics } from '../components/CommercialAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Mail, TrendingUp, Users, MousePointer, Calendar, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Contact, Projet, Contrat } from '../lib/types'

interface EmailStats {
  total_campaigns: number
  total_emails_sent: number
  total_emails_opened: number
  total_emails_clicked: number
  total_emails_bounced: number
  total_emails_failed: number
  avg_open_rate: number
  avg_click_rate: number
  avg_bounce_rate: number
}

interface CampaignPerformance {
  campaign_name: string
  emails_sent: number
  emails_opened: number
  emails_clicked: number
  open_rate: number
  click_rate: number
}

interface EmailActivity {
  date: string
  emails_sent: number
  emails_opened: number
  emails_clicked: number
}

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([])
  const [emailActivity, setEmailActivity] = useState<EmailActivity[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [user, selectedTimeframe])

  if (loading) return null

  if (!user) {
    navigate('/login')
    return null
  }

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        loadBasicData(),
        loadEmailStatistics(),
        loadCampaignPerformance(),
        loadEmailActivity()
      ])
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBasicData = async () => {
    try {
      const [
        { data: contactsData },
        { data: projetsData },
        { data: contratsData }
      ] = await Promise.all([
        supabase.from('contact').select('*').order('created_at', { ascending: false }),
        supabase.from('projets').select('*').order('created_at', { ascending: false }),
        supabase.from('contrats').select('*').order('contrat_date_creation', { ascending: false })
      ])
      
      setContacts(contactsData || [])
      setProjets(projetsData || [])
      setContrats(contratsData || [])
    } catch (error) {
      console.error('Error loading basic data:', error)
    }
  }

  const loadEmailStatistics = async () => {
    try {
      // Statistiques globales des emails
      const { data: campaignsData } = await supabase
        .from('campagnes_email')
        .select('tracking_stats')

      const { data: queueData } = await supabase
        .from('email_queue')
        .select('statut')

      const { data: logsData } = await supabase
        .from('email_logs')
        .select('statut')

      // Calculer les statistiques
      let totalSent = 0
      let totalOpened = 0
      let totalClicked = 0
      let totalBounced = 0
      
      if (campaignsData) {
        campaignsData.forEach(campaign => {
          if (campaign.tracking_stats) {
            totalSent += campaign.tracking_stats.envois || 0
            totalOpened += campaign.tracking_stats.ouvertures || 0
            totalClicked += campaign.tracking_stats.clics || 0
            totalBounced += campaign.tracking_stats.bounces || 0
          }
        })
      }

      const queueSent = queueData?.filter(q => q.statut === 'sent').length || 0
      const queueFailed = queueData?.filter(q => q.statut === 'failed').length || 0
      
      const logsSent = logsData?.filter(l => l.statut === 'sent').length || 0
      
      totalSent = Math.max(totalSent, queueSent, logsSent)

      const stats: EmailStats = {
        total_campaigns: campaignsData?.length || 0,
        total_emails_sent: totalSent,
        total_emails_opened: totalOpened,
        total_emails_clicked: totalClicked,
        total_emails_bounced: totalBounced,
        total_emails_failed: queueFailed,
        avg_open_rate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        avg_click_rate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
        avg_bounce_rate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      }

      setEmailStats(stats)
    } catch (error) {
      console.error('Error loading email statistics:', error)
    }
  }

  const loadCampaignPerformance = async () => {
    try {
      const { data: campaigns } = await supabase
        .from('campagnes_email')
        .select('nom, tracking_stats, contact_count')
        .order('created_at', { ascending: false })
        .limit(10)

      const performance: CampaignPerformance[] = campaigns?.map(campaign => {
        const stats = campaign.tracking_stats || {}
        const sent = stats.envois || 0
        const opened = stats.ouvertures || 0
        const clicked = stats.clics || 0

        return {
          campaign_name: campaign.nom || 'Sans nom',
          emails_sent: sent,
          emails_opened: opened,
          emails_clicked: clicked,
          open_rate: sent > 0 ? (opened / sent) * 100 : 0,
          click_rate: opened > 0 ? (clicked / opened) * 100 : 0
        }
      }) || []

      setCampaignPerformance(performance)
    } catch (error) {
      console.error('Error loading campaign performance:', error)
    }
  }

  const loadEmailActivity = async () => {
    try {
      // Activité des emails par jour (derniers 30 jours)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: queueActivity } = await supabase
        .from('email_queue')
        .select('created_at, statut')
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Grouper par date
      const activityByDate: { [key: string]: { sent: number, opened: number, clicked: number } } = {}

      queueActivity?.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0]
        if (!activityByDate[date]) {
          activityByDate[date] = { sent: 0, opened: 0, clicked: 0 }
        }
        if (item.statut === 'sent') {
          activityByDate[date].sent++
        }
      })

      const activity: EmailActivity[] = Object.entries(activityByDate)
        .map(([date, stats]) => ({
          date,
          emails_sent: stats.sent,
          emails_opened: stats.opened,
          emails_clicked: stats.clicked
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setEmailActivity(activity)
    } catch (error) {
      console.error('Error loading email activity:', error)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <Layout title="Analytics Commerciale">
      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emails" className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>Emails & Campagnes</span>
          </TabsTrigger>
          <TabsTrigger value="commercial" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Performance Commerciale</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Revenus</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Activité</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Statistiques Email</h2>
              <p className="text-muted-foreground">Performance détaillée des campagnes email</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
              <Badge className="bg-green-100 text-green-800">
                Temps réel
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Emails Envoyés</p>
                    <p className="text-2xl font-bold">{emailStats?.total_emails_sent || 0}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-green-100">
                    <MousePointer className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Taux d'Ouverture</p>
                    <p className="text-2xl font-bold">{emailStats?.avg_open_rate.toFixed(1) || 0}%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+2.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Taux de Clic</p>
                    <p className="text-2xl font-bold">{emailStats?.avg_click_rate.toFixed(1) || 0}%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+0.8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-orange-100">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Campagnes Actives</p>
                    <p className="text-2xl font-bold">{emailStats?.total_campaigns || 0}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activité Emails (30 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={emailActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="emails_sent" stroke="#8884d8" strokeWidth={2} name="Envoyés" />
                    <Line type="monotone" dataKey="emails_opened" stroke="#82ca9d" strokeWidth={2} name="Ouverts" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance des Campagnes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignPerformance.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="campaign_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="open_rate" fill="#8884d8" name="Taux d'ouverture %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détail des Campagnes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignPerformance.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-medium">{campaign.campaign_name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{campaign.emails_sent} envoyés</span>
                        <span>{campaign.emails_opened} ouverts</span>
                        <span>{campaign.emails_clicked} clics</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{campaign.open_rate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Taux d'ouverture</div>
                    </div>
                  </div>
                ))}
                {campaignPerformance.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune campagne disponible</p>
                    <p className="text-sm">Créez votre première campagne pour voir les statistiques</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commercial">
          <CommercialAnalytics 
            contacts={contacts} 
            projets={projets} 
            contrats={contrats} 
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analyse des revenus en cours de développement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité Générale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tableau d'activité en cours de développement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  )
}
