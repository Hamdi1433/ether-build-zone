import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Eye, Settings, Save, Globe, BarChart3, Copy, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/use-toast'

interface LandingPage {
  id: string
  slug: string
  template: string
  title: string
  settings: any
  status: 'draft' | 'live' | 'archived'
  created_at: string
  updated_at: string
}

interface PageTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: string
}

const defaultTemplates: PageTemplate[] = [
  {
    id: 'mutuelle-express',
    name: 'Mutuelle Santé Express',
    description: 'LP 3 étapes - promesse prix/garanties + comparateur',
    preview: '🏥',
    category: 'santé'
  },
  {
    id: 'rappel-devis',
    name: 'Rappel Devis 48h',
    description: 'LP de relance personnalisée avec tracking email',
    preview: '⏰',
    category: 'relance'
  },
  {
    id: 'mutuelle-senior',
    name: 'Mutuelle Sénior 60+',
    description: 'Argumentaire optique/dentaire/audiologie',
    preview: '👴',
    category: 'santé'
  },
  {
    id: 'assurance-emprunteur',
    name: 'Assurance Emprunteur',
    description: 'Économie moyenne/an + comparatif garanties',
    preview: '🏠',
    category: 'assurance'
  },
  {
    id: 'parrainage-flash',
    name: 'Parrainage Flash',
    description: 'Offre limitée avec incentive (ex. 30€ carte cadeau)',
    preview: '🎁',
    category: 'promotion'
  }
]

export function LandingPageBuilder() {
  const [pages, setPages] = useState<LandingPage[]>([])
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      // Pour l'instant, simuler des données
      const mockPages: LandingPage[] = [
        {
          id: '1',
          slug: 'mutuelle-express-v1',
          template: 'mutuelle-express',
          title: 'Mutuelle Santé Express - Version 1',
          settings: {
            hero: {
              title: 'Trouvez votre mutuelle santé idéale',
              subtitle: 'Comparez et économisez jusqu\'à 30% sur votre complémentaire santé',
              cta: 'Démarrer ma simulation'
            },
            utm_params: {
              source: 'facebook',
              medium: 'cpc',
              campaign: 'mutuelle_q1_2024'
            }
          },
          status: 'live',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setPages(mockPages)
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les landing pages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createPage = async (template: string, title: string) => {
    try {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      const newPage: LandingPage = {
        id: Date.now().toString(),
        slug,
        template,
        title,
        settings: getDefaultSettings(template),
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setPages([newPage, ...pages])
      setIsCreateModalOpen(false)
      
      toast({
        title: "Page créée",
        description: `La landing page "${title}" a été créée avec succès`,
      })
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast({
        title: "Erreur",
        description: "Impossible de créer la landing page",
        variant: "destructive",
      })
    }
  }

  const getDefaultSettings = (template: string) => {
    const templateConfig = defaultTemplates.find(t => t.id === template)
    
    return {
      hero: {
        title: 'Votre titre principal',
        subtitle: 'Votre sous-titre accrocheur',
        cta: 'Commencer'
      },
      form: {
        steps: [
          {
            title: 'Vos informations',
            fields: ['prenom', 'nom', 'email', 'telephone']
          },
          {
            title: 'Votre situation',
            fields: ['age', 'code_postal', 'situation']
          },
          {
            title: 'Vos besoins',
            fields: ['garanties', 'budget']
          }
        ]
      },
      design: {
        theme: 'blue',
        layout: 'centered'
      },
      tracking: {
        gtag: '',
        facebook_pixel: '',
        tiktok_pixel: ''
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500'
      case 'draft': return 'bg-yellow-500'
      case 'archived': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Landing Page Builder</h1>
          <p className="text-muted-foreground">
            Créez et gérez vos landing pages pour la génération de leads
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle landing page</DialogTitle>
              <DialogDescription>
                Choisissez un template pour commencer
              </DialogDescription>
            </DialogHeader>
            <CreatePageForm 
              templates={defaultTemplates}
              onCreatePage={createPage}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
                <p className="text-2xl font-bold">{pages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pages Live</p>
                <p className="text-2xl font-bold">{pages.filter(p => p.status === 'live').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Vues Totales</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Taux Conversion</p>
                <p className="text-2xl font-bold">12.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des pages */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Landing Pages</CardTitle>
          <CardDescription>
            Gérez vos pages de destination et suivez leurs performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {defaultTemplates.find(t => t.id === page.template)?.preview || '📄'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(page.status)} text-white`}
                      >
                        {page.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Modifié le {new Date(page.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Prévisualiser
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Éditer
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Dupliquer
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            ))}
            
            {pages.length === 0 && (
              <div className="text-center py-12">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucune landing page</h3>
                <p className="text-muted-foreground">
                  Créez votre première landing page pour commencer à générer des leads
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer ma première page
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreatePageForm({ 
  templates, 
  onCreatePage 
}: { 
  templates: PageTemplate[]
  onCreatePage: (template: string, title: string) => void 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [title, setTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTemplate && title.trim()) {
      onCreatePage(selectedTemplate, title.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="title">Titre de la page</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Mutuelle Santé Promo Q1 2024"
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Choisir un template</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{template.preview}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {template.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setTitle('')}>
          Annuler
        </Button>
        <Button type="submit" disabled={!selectedTemplate || !title.trim()}>
          Créer la page
        </Button>
      </div>
    </form>
  )
}