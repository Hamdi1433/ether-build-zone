
import React from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { RevenueAnalytics } from '../../components/analytics/RevenueAnalytics'
import { ProductAnalytics } from '../../components/analytics/ProductAnalytics'
import { PipelineAnalytics } from '../../components/analytics/PipelineAnalytics'
import { CommercialPerformanceAnalytics } from '../../components/analytics/CommercialPerformanceAnalytics'
import { AIAnalytics } from '../../components/ai/AIAnalytics'

export default function Analytics() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div>Chargement...</div>

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
            <TabsTrigger value="ai">IA Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <RevenueAnalytics />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductAnalytics />
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <PipelineAnalytics />
          </TabsContent>

          <TabsContent value="commercial" className="space-y-4">
            <CommercialPerformanceAnalytics />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AIAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
