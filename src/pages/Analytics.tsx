
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
import { supabase } from '../lib/supabase'
import type { Contact, Projet, Contrat } from '../lib/types'

export default function Analytics() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [contrats, setContrats] = useState<Contrat[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [contactsResult, projetsResult, contratsResult] = await Promise.all([
        supabase.from('contact').select('*'),
        supabase.from('projets').select('*'),
        supabase.from('contrats').select('*')
      ])

      setContacts(contactsResult.data || [])
      setProjets(projetsResult.data || [])
      setContrats(contratsResult.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || dataLoading) return <div>Chargement...</div>

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
            <RevenueAnalytics projets={projets} contrats={contrats} />
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <ProductAnalytics projets={projets} contrats={contrats} />
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <PipelineAnalytics projets={projets} contrats={contrats} />
          </TabsContent>

          <TabsContent value="commercial" className="space-y-4">
            <CommercialPerformanceAnalytics contacts={contacts} projets={projets} contrats={contrats} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AIAnalytics contacts={contacts} projets={projets} contrats={contrats} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
