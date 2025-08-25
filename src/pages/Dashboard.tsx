
import React from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { DashboardTab } from '../components/DashboardTab'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Layout title="🚀 Tableau de Bord CRM">
      <DashboardTab 
        stats={{
          totalContacts: 0,
          activeClients: 0,
          prospects: 0,
          totalRevenue: 0,
          conversionRate: '0%',
          avgRevenuePerClient: '0€',
          growthRate: '0%',
          activeCampaigns: 0,
          crossSellOpportunities: 0,
          aiScore: 0,
          monthlyGrowth: 0,
          churnRate: 0,
          customerLifetimeValue: 0,
          acquisitionCost: 0,
          retentionRate: 0,
          upsellRate: 0
        }}
        clients={[]}
        projets={[]}
        contrats={[]}
        contacts={[]}
        recentActivities={[]}
        upcomingTasks={[]}
        performanceMetrics={{}}
        crossSellInsights={[]}
      />
    </Layout>
  )
}
