
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Plus,
  Trash2,
  Eye,
  Copy,
  Settings,
  Target,
  Users,
  TrendingUp,
  FormInput,
  Palette,
  Code,
  Share
} from 'lucide-react'
import { FormEngine } from './FormEngine'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/use-toast'

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'textarea'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    pattern?: string
    message?: string
  }
}

interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface LandingForm {
  id?: number
  nom: string
  description?: string
  type_campagne: 'relance' | 'cross_sell' | 'acquisition'
  produit_cible: string
  etapes: FormStep[]
  design: {
    couleur_primaire: string
    couleur_secondaire: string
    police: string
    style: string
  }
  tracking: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }
  statut: 'draft' | 'active' | 'paused'
  created_at?: string
}

const defaultFormField: FormField = {
  id: '',
  type: 'text',
  label: '',
  placeholder: '',
  required: false
}

const defaultFormStep: FormStep = {
  id: '',
  title: 'Nouvelle étape',
  description: '',
  fields: []
}

export function LandingFormBuilder() {
  const [forms, setForms] = useState<LandingForm[]>([])
  const [currentForm, setCurrentForm] = useState<LandingForm | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      const { data, error } = await supabase
        .from('landing_forms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setForms(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des formulaires:', error)
    }
  }

  const createNewForm = () => {
    const newForm: LandingForm = {
      nom: 'Nouveau formulaire',
      description: '',
      type_campagne: 'acquisition',
      produit_cible: 'mutuelle_sante',
      etapes: [{
        id: 'step-1',
        title: 'Informations de contact',
        description: 'Vos coordonnées pour recevoir votre devis',
        fields: [
          {
            id: 'prenom',
            type: 'text',
            label: 'Prénom',
            placeholder: 'Votre prénom',
            required: true
          },
          {
            id: 'nom',
            type: 'text',
            label: 'Nom',
            placeholder: 'Votre nom',
            required: true
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'votre.email@exemple.fr',
            required: true,
            validation: {
              pattern: '^[^@]+@[^@]+\\.[^@]+$',
              message: 'Email invalide'
            }
          },
          {
            id: 'telephone',
            type: 'tel',
            label: 'Téléphone',
            placeholder: '06 12 34 56 78',
            required: true,
            validation: {
              pattern: '^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$',
              message: 'Numéro français invalide'
            }
          }
        ]
      }],
      design: {
        couleur_primaire: '#3B82F6',
        couleur_secondaire: '#1E40AF',
        police: 'Inter',
        style: 'moderne'
      },
      tracking: {
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'mutuelle_sante'
      },
      statut: 'draft'
    }

    setCurrentForm(newForm)
    setIsEditing(true)
  }

  const saveForm = async () => {
    if (!currentForm) return

    try {
      if (currentForm.id) {
        // Mise à jour
        const { error } = await supabase
          .from('landing_forms')
          .update({
            nom: currentForm.nom,
            description: currentForm.description,
            type_campagne: currentForm.type_campagne,
            produit_cible: currentForm.produit_cible,
            etapes: currentForm.etapes,
            design: currentForm.design,
            tracking: currentForm.tracking,
            statut: currentForm.statut,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentForm.id)

        if (error) throw error
      } else {
        // Création
        const { data, error } = await supabase
          .from('landing_forms')
          .insert([{
            nom: currentForm.nom,
            description: currentForm.description,
            type_campagne: currentForm.type_campagne,
            produit_cible: currentForm.produit_cible,
            etapes: currentForm.etapes,
            design: currentForm.design,
            tracking: currentForm.tracking,
            statut: currentForm.statut
          }])
          .select()
          .single()

        if (error) throw error
        setCurrentForm({ ...currentForm, id: data.id })
      }

      toast({
        title: "Formulaire sauvegardé",
        description: "Le formulaire a été sauvegardé avec succès.",
      })

      loadForms()
      setIsEditing(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le formulaire.",
        variant: "destructive",
      })
    }
  }

  const addField = (stepId: string) => {
    if (!currentForm) return

    const newField: FormField = {
      ...defaultFormField,
      id: `field-${Date.now()}`,
      label: 'Nouveau champ'
    }

    const updatedSteps = currentForm.etapes.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: [...step.fields, newField]
        }
      }
      return step
    })

    setCurrentForm({
      ...currentForm,
      etapes: updatedSteps
    })
  }

  const removeField = (stepId: string, fieldId: string) => {
    if (!currentForm) return

    const updatedSteps = currentForm.etapes.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: step.fields.filter(field => field.id !== fieldId)
        }
      }
      return step
    })

    setCurrentForm({
      ...currentForm,
      etapes: updatedSteps
    })
  }

  const updateField = (stepId: string, fieldId: string, updates: Partial<FormField>) => {
    if (!currentForm) return

    const updatedSteps = currentForm.etapes.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          fields: step.fields.map(field => 
            field.id === fieldId ? { ...field, ...updates } : field
          )
        }
      }
      return step
    })

    setCurrentForm({
      ...currentForm,
      etapes: updatedSteps
    })
  }

  const addStep = () => {
    if (!currentForm) return

    const newStep: FormStep = {
      ...defaultFormStep,
      id: `step-${Date.now()}`,
      title: `Étape ${currentForm.etapes.length + 1}`
    }

    setCurrentForm({
      ...currentForm,
      etapes: [...currentForm.etapes, newStep]
    })
  }

  const generateEmbedCode = (form: LandingForm) => {
    return `<iframe src="${window.location.origin}/form/${form.id}" width="100%" height="600" frameborder="0"></iframe>`
  }

  if (previewMode && currentForm) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Aperçu du formulaire</h2>
          <Button onClick={() => setPreviewMode(false)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Retour à l'édition
          </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <FormEngine
            formId={`form-${currentForm.id}`}
            pageSlug="preview"
            utmParams={currentForm.tracking}
          />
        </div>
      </div>
    )
  }

  if (isEditing && currentForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {currentForm.id ? 'Modifier le formulaire' : 'Nouveau formulaire'}
          </h2>
          <div className="space-x-2">
            <Button onClick={() => setPreviewMode(true)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={saveForm}>
              Sauvegarder
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline">
              Annuler
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Configuration générale */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration générale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du formulaire</Label>
                    <Input
                      id="nom"
                      value={currentForm.nom}
                      onChange={(e) => setCurrentForm({ ...currentForm, nom: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de campagne</Label>
                    <Select
                      value={currentForm.type_campagne}
                      onValueChange={(value) => setCurrentForm({ ...currentForm, type_campagne: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acquisition">Acquisition</SelectItem>
                        <SelectItem value="relance">Relance</SelectItem>
                        <SelectItem value="cross_sell">Cross-selling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentForm.description || ''}
                    onChange={(e) => setCurrentForm({ ...currentForm, description: e.target.value })}
                    placeholder="Description du formulaire..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="produit">Produit ciblé</Label>
                  <Select
                    value={currentForm.produit_cible}
                    onValueChange={(value) => setCurrentForm({ ...currentForm, produit_cible: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mutuelle_sante">Mutuelle Santé</SelectItem>
                      <SelectItem value="assurance_auto">Assurance Auto</SelectItem>
                      <SelectItem value="assurance_habitation">Assurance Habitation</SelectItem>
                      <SelectItem value="prevoyance">Prévoyance</SelectItem>
                      <SelectItem value="epargne">Épargne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Étapes du formulaire */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Étapes du formulaire</h3>
                <Button onClick={addStep} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une étape
                </Button>
              </div>

              {currentForm.etapes.map((step, stepIndex) => (
                <Card key={step.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Input
                          value={step.title}
                          onChange={(e) => {
                            const updatedSteps = [...currentForm.etapes]
                            updatedSteps[stepIndex] = { ...step, title: e.target.value }
                            setCurrentForm({ ...currentForm, etapes: updatedSteps })
                          }}
                          placeholder="Titre de l'étape"
                        />
                        <Input
                          value={step.description || ''}
                          onChange={(e) => {
                            const updatedSteps = [...currentForm.etapes]
                            updatedSteps[stepIndex] = { ...step, description: e.target.value }
                            setCurrentForm({ ...currentForm, etapes: updatedSteps })
                          }}
                          placeholder="Description de l'étape"
                        />
                      </div>
                      <Button
                        onClick={() => addField(step.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {step.fields.map((field, fieldIndex) => (
                        <div key={field.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Champ {fieldIndex + 1}</h4>
                            <Button
                              onClick={() => removeField(step.id, field.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value) => updateField(step.id, field.id, { type: value as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Texte</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="tel">Téléphone</SelectItem>
                                  <SelectItem value="select">Liste déroulante</SelectItem>
                                  <SelectItem value="checkbox">Cases à cocher</SelectItem>
                                  <SelectItem value="radio">Boutons radio</SelectItem>
                                  <SelectItem value="textarea">Zone de texte</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Label</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(step.id, field.id, { label: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Placeholder</Label>
                              <Input
                                value={field.placeholder || ''}
                                onChange={(e) => updateField(step.id, field.id, { placeholder: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`required-${field.id}`}
                              checked={field.required}
                              onCheckedChange={(checked) => updateField(step.id, field.id, { required: checked })}
                            />
                            <Label htmlFor={`required-${field.id}`}>Champ obligatoire</Label>
                          </div>

                          {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
                            <div className="space-y-2">
                              <Label>Options (une par ligne)</Label>
                              <Textarea
                                value={field.options?.join('\n') || ''}
                                onChange={(e) => updateField(step.id, field.id, { 
                                  options: e.target.value.split('\n').filter(o => o.trim()) 
                                })}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Design et apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Couleur primaire</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={currentForm.design.couleur_primaire}
                        onChange={(e) => setCurrentForm({
                          ...currentForm,
                          design: { ...currentForm.design, couleur_primaire: e.target.value }
                        })}
                        className="w-20"
                      />
                      <Input
                        value={currentForm.design.couleur_primaire}
                        onChange={(e) => setCurrentForm({
                          ...currentForm,
                          design: { ...currentForm.design, couleur_primaire: e.target.value }
                        })}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Couleur secondaire</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={currentForm.design.couleur_secondaire}
                        onChange={(e) => setCurrentForm({
                          ...currentForm,
                          design: { ...currentForm.design, couleur_secondaire: e.target.value }
                        })}
                        className="w-20"
                      />
                      <Input
                        value={currentForm.design.couleur_secondaire}
                        onChange={(e) => setCurrentForm({
                          ...currentForm,
                          design: { ...currentForm.design, couleur_secondaire: e.target.value }
                        })}
                        placeholder="#1E40AF"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Police de caractères</Label>
                    <Select
                      value={currentForm.design.police}
                      onValueChange={(value) => setCurrentForm({
                        ...currentForm,
                        design: { ...currentForm.design, police: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Style</Label>
                    <Select
                      value={currentForm.design.style}
                      onValueChange={(value) => setCurrentForm({
                        ...currentForm,
                        design: { ...currentForm.design, style: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moderne">Moderne</SelectItem>
                        <SelectItem value="classique">Classique</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="elegant">Élégant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Paramètres de tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>UTM Source</Label>
                    <Input
                      value={currentForm.tracking.utm_source || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        tracking: { ...currentForm.tracking, utm_source: e.target.value }
                      })}
                      placeholder="facebook, google, email..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>UTM Medium</Label>
                    <Input
                      value={currentForm.tracking.utm_medium || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        tracking: { ...currentForm.tracking, utm_medium: e.target.value }
                      })}
                      placeholder="cpc, email, social..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>UTM Campaign</Label>
                    <Input
                      value={currentForm.tracking.utm_campaign || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        tracking: { ...currentForm.tracking, utm_campaign: e.target.value }
                      })}
                      placeholder="mutuelle_sante_q1..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres avancés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Statut du formulaire</Label>
                  <Select
                    value={currentForm.statut}
                    onValueChange={(value) => setCurrentForm({ ...currentForm, statut: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="paused">En pause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Formulaires Landing Pages</h1>
          <p className="text-muted-foreground">
            Créez des formulaires optimisés pour vos campagnes de relance et cross-selling
          </p>
        </div>
        <Button onClick={createNewForm}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau formulaire
        </Button>
      </div>

      {/* Stats des formulaires */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Formulaires</CardTitle>
            <FormInput className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
            <p className="text-xs text-muted-foreground">
              {forms.filter(f => f.statut === 'active').length} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2x</div>
            <p className="text-xs text-muted-foreground">
              Retour sur investissement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des formulaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{form.nom}</CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </div>
                <Badge variant={form.statut === 'active' ? 'default' : 'secondary'}>
                  {form.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{form.type_campagne}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Produit:</span>
                  <span className="font-medium">{form.produit_cible}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Étapes:</span>
                  <span className="font-medium">{form.etapes.length}</span>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      setCurrentForm(form)
                      setIsEditing(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Éditer
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentForm(form)
                      setPreviewMode(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Aperçu
                  </Button>
                  <Button
                    onClick={() => {
                      const code = generateEmbedCode(form)
                      navigator.clipboard.writeText(code)
                      toast({
                        title: "Code copié",
                        description: "Le code d'intégration a été copié dans le presse-papiers.",
                      })
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
