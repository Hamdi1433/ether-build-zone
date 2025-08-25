
import React, { useState } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { LandingPageBuilder } from '../../components/LandingPageBuilder'
import { UTMManager } from '../../components/UTMManager'
import { LandingFormBuilder } from '../../components/LandingFormBuilder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { 
  Globe, 
  Link2, 
  FormInput, 
  Target, 
  BarChart3, 
  Users, 
  TrendingUp,
  Eye,
  MousePointer,
  PhoneCall 
} from 'lucide-react'

export default function LeadGenerationPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div>Chargement...</div>

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Layout title="Génération de Leads">
      <div className="space-y-6">
        {/* Header avec objectifs SMART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-6 h-6 mr-2 text-blue-600" />
                Objectifs SMART - Q1 2024
              </CardTitle>
              <CardDescription>
                Industrialisation de la génération de leads via landing pages et publicités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Génération</span>
                    <Badge variant="outline">≥ 2,000 leads/mois</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Coût</span>
                    <Badge variant="outline">CPL ≤ 12€</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Conversion</span>
                    <Badge variant="outline">CVR ≥ 12%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reach tél</span>
                    <Badge variant="outline">≥ 45% à J+3</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Globale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ce mois</span>
                  <span className="font-semibold">1,234 leads</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPL moyen</span>
                  <span className="font-semibold text-green-600">8.90€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversion</span>
                  <span className="font-semibold text-blue-600">14.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interface principal avec onglets */}
        <Tabs defaultValue="forms" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forms" className="flex items-center space-x-2">
              <FormInput className="w-4 h-4" />
              <span>Formulaires</span>
            </TabsTrigger>
            <TabsTrigger value="landing-pages" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Landing Pages</span>
            </TabsTrigger>
            <TabsTrigger value="utm-links" className="flex items-center space-x-2">
              <Link2 className="w-4 h-4" />
              <span>Liens UTM</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="forms" className="space-y-4">
            <LandingFormBuilder />
          </TabsContent>
          
          <TabsContent value="landing-pages" className="space-y-4">
            <LandingPageBuilder />
          </TabsContent>
          
          <TabsContent value="utm-links" className="space-y-4">
            <UTMManager />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funnel de Conversion</CardTitle>
                  <CardDescription>Performance par étape</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="font-medium">Impressions</span>
                      <div className="text-right">
                        <div className="font-bold">125,000</div>
                        <div className="text-sm text-muted-foreground">100%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="font-medium">Clics LP</span>
                      <div className="text-right">
                        <div className="font-bold">3,500</div>
                        <div className="text-sm text-muted-foreground">2.8% CTR</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span className="font-medium">Form Start</span>
                      <div className="text-right">
                        <div className="font-bold">1,750</div>
                        <div className="text-sm text-muted-foreground">50% des clics</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                      <span className="font-medium">Form Submit</span>
                      <div className="text-right">
                        <div className="font-bold">1,234</div>
                        <div className="text-sm text-muted-foreground">70% completion</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded">
                      <span className="font-medium">RDV Pris</span>
                      <div className="text-right">
                        <div className="font-bold">147</div>
                        <div className="text-sm text-muted-foreground">12% CVR</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance par Source</CardTitle>
                  <CardDescription>ROI et coûts par canal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">Facebook Ads</div>
                        <div className="text-sm text-muted-foreground">890 leads</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">7.20€ CPL</div>
                        <div className="text-sm">ROAS: 5.2x</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">TikTok Ads</div>
                        <div className="text-sm text-muted-foreground">234 leads</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">9.50€ CPL</div>
                        <div className="text-sm">ROAS: 3.8x</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">Email Relance</div>
                        <div className="text-sm text-muted-foreground">110 leads</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">2.80€ CPL</div>
                        <div className="text-sm">ROAS: 12.1x</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
