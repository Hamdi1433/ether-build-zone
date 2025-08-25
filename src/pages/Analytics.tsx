
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { RevenueAnalytics } from '../components/analytics/RevenueAnalytics'
import { ProductAnalytics } from '../components/analytics/ProductAnalytics'
import { PipelineAnalytics } from '../components/analytics/PipelineAnalytics'
import { CommercialPerformanceAnalytics } from '../components/analytics/CommercialPerformanceAnalytics'
import { AIAnalytics } from '../components/ai/AIAnalytics'

export default function Analytics() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({
    projets: [],
    contrats: [],
    contacts: []
  })

  useEffect(() => {
    // Simuler le chargement des données
    setData({
      projets: [],
      contrats: [],
      contacts: []
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Layout title="📊 Analytics & Intelligence">
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/30 p-1 rounded-xl">
          <TabsTrigger value="revenue" className="rounded-lg">💰 Revenus</TabsTrigger>
          <TabsTrigger value="products" className="rounded-lg">📦 Produits</TabsTrigger>
          <TabsTrigger value="pipeline" className="rounded-lg">🎯 Pipeline</TabsTrigger>
          <TabsTrigger value="commercial" className="rounded-lg">👔 Commercial</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg">🤖 IA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-6">
          <RevenueAnalytics projets={data.projets} contrats={data.contrats} />
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          <ProductAnalytics projets={data.projets} contrats={data.contrats} />
        </TabsContent>
        
        <TabsContent value="pipeline" className="space-y-6">
          <PipelineAnalytics projets={data.projets} contrats={data.contrats} />
        </TabsContent>
        
        <TabsContent value="commercial" className="space-y-6">
          <CommercialPerformanceAnalytics contacts={data.contacts} projets={data.projets} contrats={data.contrats} />
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-6">
          <AIAnalytics contacts={data.contacts} projets={data.projets} contrats={data.contrats} />
        </TabsContent>
      </Tabs>
    </Layout>
  )
}
