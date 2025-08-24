import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Copy, Link2, Plus, ExternalLink, Settings, BarChart3, Eye } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

interface UTMParams {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content?: string
  utm_term?: string
  ad_id?: string
  adset_id?: string
  campaign_id?: string
}

interface GeneratedLink {
  id: string
  name: string
  base_url: string
  utm_params: UTMParams
  full_url: string
  created_at: string
  clicks: number
  conversions: number
}

const UTM_SOURCES = [
  'facebook', 'instagram', 'tiktok', 'google', 'email', 'sms', 'linkedin', 'youtube', 'direct'
]

const UTM_MEDIUMS = [
  'cpc', 'cpm', 'display', 'email', 'social', 'organic', 'referral', 'newsletter', 'remarketing'
]

export function UTMManager() {
  const [links, setLinks] = useState<GeneratedLink[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = () => {
    // Simulation de données - remplacer par un appel API
    const mockLinks: GeneratedLink[] = [
      {
        id: '1',
        name: 'Facebook - Mutuelle Sénior - Q1',
        base_url: 'https://premunia.com/mutuelle-senior',
        utm_params: {
          utm_source: 'facebook',
          utm_medium: 'cpc',
          utm_campaign: 'mutuelle_senior_q1_2024',
          utm_content: 'carousel_video',
          utm_term: 'mutuelle+senior',
          ad_id: 'fb_123456',
          adset_id: 'adset_789',
          campaign_id: 'camp_456'
        },
        full_url: 'https://premunia.com/mutuelle-senior?utm_source=facebook&utm_medium=cpc&utm_campaign=mutuelle_senior_q1_2024&utm_content=carousel_video&utm_term=mutuelle%2Bsenior&ad_id=fb_123456&adset_id=adset_789&campaign_id=camp_456',
        created_at: new Date().toISOString(),
        clicks: 1247,
        conversions: 156
      },
      {
        id: '2',
        name: 'Email - Relance Injoignables',
        base_url: 'https://premunia.com/rappel-devis',
        utm_params: {
          utm_source: 'email',
          utm_medium: 'newsletter',
          utm_campaign: 'relance_injoignables_j3',
          utm_content: 'cta_button'
        },
        full_url: 'https://premunia.com/rappel-devis?utm_source=email&utm_medium=newsletter&utm_campaign=relance_injoignables_j3&utm_content=cta_button',
        created_at: new Date().toISOString(),
        clicks: 324,
        conversions: 89
      }
    ]
    setLinks(mockLinks)
  }

  const generateURL = (baseUrl: string, utmParams: UTMParams): string => {
    const params = new URLSearchParams()
    
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.append(key, value.trim())
      }
    })

    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`
  }

  const createLink = (name: string, baseUrl: string, utmParams: UTMParams) => {
    const fullUrl = generateURL(baseUrl, utmParams)
    
    const newLink: GeneratedLink = {
      id: Date.now().toString(),
      name,
      base_url: baseUrl,
      utm_params: utmParams,
      full_url: fullUrl,
      created_at: new Date().toISOString(),
      clicks: 0,
      conversions: 0
    }

    setLinks([newLink, ...links])
    setIsCreateModalOpen(false)
    
    toast({
      title: "Lien créé",
      description: `Le lien "${name}" a été généré avec succès`,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié !",
      description: "Le lien a été copié dans le presse-papiers",
    })
  }

  const getConversionRate = (clicks: number, conversions: number): string => {
    if (clicks === 0) return '0%'
    return `${((conversions / clicks) * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestionnaire UTM</h1>
          <p className="text-muted-foreground">
            Générez et suivez vos liens avec paramètres UTM pour un tracking précis
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Lien
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Générer un nouveau lien UTM</DialogTitle>
              <DialogDescription>
                Configurez les paramètres de tracking pour votre campagne
              </DialogDescription>
            </DialogHeader>
            <UTMLinkForm onCreateLink={createLink} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Link2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Liens</p>
                <p className="text-2xl font-bold">{links.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Clics</p>
                <p className="text-2xl font-bold">
                  {links.reduce((sum, link) => sum + link.clicks, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">
                  {links.reduce((sum, link) => sum + link.conversions, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Taux Moyen</p>
                <p className="text-2xl font-bold">
                  {getConversionRate(
                    links.reduce((sum, link) => sum + link.clicks, 0),
                    links.reduce((sum, link) => sum + link.conversions, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des liens */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Liens UTM</CardTitle>
          <CardDescription>
            Gérez et suivez les performances de vos liens de campagne
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{link.name}</h3>
                      <Badge variant="outline">
                        {link.utm_params.utm_source}
                      </Badge>
                      <Badge variant="secondary">
                        {link.utm_params.utm_medium}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded break-all">
                      {link.full_url}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {link.clicks.toLocaleString()} clics
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {link.conversions} conversions ({getConversionRate(link.clicks, link.conversions)})
                      </span>
                      <span className="text-muted-foreground">
                        Créé le {new Date(link.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(link.full_url)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(link.full_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Tester
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Stats
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {links.length === 0 && (
              <div className="text-center py-12">
                <Link2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucun lien UTM</h3>
                <p className="text-muted-foreground">
                  Créez votre premier lien de campagne pour commencer le tracking
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon premier lien
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UTMLinkForm({ 
  onCreateLink 
}: { 
  onCreateLink: (name: string, baseUrl: string, utmParams: UTMParams) => void 
}) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [utmParams, setUtmParams] = useState<UTMParams>({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    ad_id: '',
    adset_id: '',
    campaign_id: ''
  })
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (baseUrl && utmParams.utm_source && utmParams.utm_medium && utmParams.utm_campaign) {
      const params = new URLSearchParams()
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value && value.trim()) {
          params.append(key, value.trim())
        }
      })
      setPreviewUrl(`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`)
    } else {
      setPreviewUrl('')
    }
  }, [baseUrl, utmParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && baseUrl.trim() && utmParams.utm_source && utmParams.utm_medium && utmParams.utm_campaign) {
      onCreateLink(name.trim(), baseUrl.trim(), utmParams)
    }
  }

  const updateUTMParam = (key: keyof UTMParams, value: string) => {
    setUtmParams(prev => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Paramètres de base</TabsTrigger>
          <TabsTrigger value="advanced">Avancé (Ads)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du lien</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Facebook - Mutuelle Sénior - Q1 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="base-url">URL de destination</Label>
              <Input
                id="base-url"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://premunia.com/mutuelle-senior"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="utm-source">Source *</Label>
                <Input
                  id="utm-source"
                  value={utmParams.utm_source}
                  onChange={(e) => updateUTMParam('utm_source', e.target.value)}
                  placeholder="facebook, google, email..."
                  list="sources"
                  required
                />
                <datalist id="sources">
                  {UTM_SOURCES.map(source => (
                    <option key={source} value={source} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label htmlFor="utm-medium">Medium *</Label>
                <Input
                  id="utm-medium"
                  value={utmParams.utm_medium}
                  onChange={(e) => updateUTMParam('utm_medium', e.target.value)}
                  placeholder="cpc, email, social..."
                  list="mediums"
                  required
                />
                <datalist id="mediums">
                  {UTM_MEDIUMS.map(medium => (
                    <option key={medium} value={medium} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <Label htmlFor="utm-campaign">Campagne *</Label>
              <Input
                id="utm-campaign"
                value={utmParams.utm_campaign}
                onChange={(e) => updateUTMParam('utm_campaign', e.target.value)}
                placeholder="mutuelle_senior_q1_2024"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="utm-content">Contenu</Label>
                <Input
                  id="utm-content"
                  value={utmParams.utm_content}
                  onChange={(e) => updateUTMParam('utm_content', e.target.value)}
                  placeholder="carousel_video, cta_button..."
                />
              </div>

              <div>
                <Label htmlFor="utm-term">Terme</Label>
                <Input
                  id="utm-term"
                  value={utmParams.utm_term}
                  onChange={(e) => updateUTMParam('utm_term', e.target.value)}
                  placeholder="mutuelle+senior"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ad-id">Ad ID</Label>
              <Input
                id="ad-id"
                value={utmParams.ad_id}
                onChange={(e) => updateUTMParam('ad_id', e.target.value)}
                placeholder="fb_123456"
              />
            </div>

            <div>
              <Label htmlFor="adset-id">AdSet ID</Label>
              <Input
                id="adset-id"
                value={utmParams.adset_id}
                onChange={(e) => updateUTMParam('adset_id', e.target.value)}
                placeholder="adset_789"
              />
            </div>

            <div>
              <Label htmlFor="campaign-id">Campaign ID</Label>
              <Input
                id="campaign-id"
                value={utmParams.campaign_id}
                onChange={(e) => updateUTMParam('campaign_id', e.target.value)}
                placeholder="camp_456"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Ces paramètres sont automatiquement remplis par Facebook/Google Ads quand vous utilisez 
            leurs variables dynamiques (ex: {'{{ad.id}}'}, {'{{adset.id}}'}).
          </div>
        </TabsContent>
      </Tabs>

      {/* Prévisualisation */}
      {previewUrl && (
        <div className="space-y-2">
          <Label>Prévisualisation du lien</Label>
          <div className="text-sm font-mono bg-muted p-3 rounded break-all">
            {previewUrl}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(previewUrl)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copier l'aperçu
          </Button>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setName('')}>
          Réinitialiser
        </Button>
        <Button 
          type="submit" 
          disabled={!name.trim() || !baseUrl.trim() || !utmParams.utm_source || !utmParams.utm_medium || !utmParams.utm_campaign}
        >
          Générer le lien
        </Button>
      </div>
    </form>
  )
}