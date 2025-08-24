"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { supabase } from "../lib/supabase"
import { 
  Play, Pause, Settings, Plus, Trash2, Calendar, 
  Mail, Users, Target, Clock, CheckCircle
} from "lucide-react"
import { useToast } from "../hooks/use-toast"

interface Workflow {
  id: number
  nom: string
  description?: string
  declencheur: string
  type_action: string
  segment_id?: number
  template_id?: number
  delai_jours?: number
  actif: boolean
  created_at: string
}

interface Segment {
  id: number
  nom: string
  description?: string
  couleur?: string
}

interface EmailTemplate {
  id: number
  nom: string
  sujet: string
}

export function WorkflowManager() {
  const { toast } = useToast()
  
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal workflow
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [workflowForm, setWorkflowForm] = useState({
    nom: '',
    description: '',
    declencheur: 'manuel',
    type_action: 'email_immediate',
    segment_id: '',
    template_id: '',
    delai_jours: 3
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [workflowsResult, segmentsResult, templatesResult] = await Promise.all([
        supabase.from('workflows').select('*').order('created_at', { ascending: false }),
        supabase.from('segments').select('*').order('nom', { ascending: true }),
        supabase.from('email_templates').select('id, nom, sujet').order('nom', { ascending: true })
      ])

      if (workflowsResult.error) throw workflowsResult.error
      if (segmentsResult.error) throw segmentsResult.error
      if (templatesResult.error) throw templatesResult.error

      setWorkflows(workflowsResult.data || [])
      setSegments(segmentsResult.data || [])
      setEmailTemplates(templatesResult.data || [])
    } catch (error) {
      console.error('Error loading workflow data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null)
    setWorkflowForm({
      nom: '',
      description: '',
      declencheur: 'manuel',
      type_action: 'email_immediate',
      segment_id: '',
      template_id: '',
      delai_jours: 3
    })
    setIsWorkflowModalOpen(true)
  }

  const handleEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow)
    setWorkflowForm({
      nom: workflow.nom,
      description: workflow.description || '',
      declencheur: workflow.declencheur,
      type_action: workflow.type_action,
      segment_id: workflow.segment_id?.toString() || '',
      template_id: workflow.template_id?.toString() || '',
      delai_jours: workflow.delai_jours || 3
    })
    setIsWorkflowModalOpen(true)
  }

  const handleSaveWorkflow = async () => {
    try {
      const workflowData = {
        nom: workflowForm.nom,
        description: workflowForm.description || null,
        declencheur: workflowForm.declencheur,
        type_action: workflowForm.type_action,
        segment_id: workflowForm.segment_id ? parseInt(workflowForm.segment_id) : null,
        template_id: workflowForm.template_id ? parseInt(workflowForm.template_id) : null,
        delai_jours: workflowForm.type_action.includes('planifie') ? workflowForm.delai_jours : null,
        actif: false, // Nouveau workflow inactif par défaut
        etapes: {
          type: workflowForm.type_action,
          segment_id: workflowForm.segment_id,
          template_id: workflowForm.template_id,
          delai_jours: workflowForm.delai_jours
        }
      }

      let result
      if (editingWorkflow) {
        result = await supabase
          .from('workflows')
          .update(workflowData)
          .eq('id', editingWorkflow.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('workflows')
          .insert([workflowData])
          .select()
          .single()
      }

      if (result.error) throw result.error

      toast({
        title: "Succès",
        description: `Workflow ${editingWorkflow ? 'modifié' : 'créé'} avec succès`,
      })

      setIsWorkflowModalOpen(false)
      loadData()
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive"
      })
    }
  }

  const handleToggleWorkflow = async (workflow: Workflow) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ actif: !workflow.actif })
        .eq('id', workflow.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: `Workflow ${!workflow.actif ? 'activé' : 'désactivé'}`,
      })

      loadData()
    } catch (error) {
      console.error('Error toggling workflow:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification",
        variant: "destructive"
      })
    }
  }

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le workflow "${workflow.nom}" ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflow.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Workflow supprimé avec succès",
      })

      loadData()
    } catch (error) {
      console.error('Error deleting workflow:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      })
    }
  }

  const handleExecuteWorkflow = async (workflow: Workflow) => {
    try {
      const { data, error } = await supabase.functions.invoke('execute-automation', {
        body: {
          workflow_id: workflow.id,
          manual_trigger: true
        }
      })

      if (error) throw error

      toast({
        title: "Succès",
        description: `Workflow "${workflow.nom}" exécuté avec succès`,
      })
    } catch (error) {
      console.error('Error executing workflow:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'exécution",
        variant: "destructive"
      })
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email_immediate': return Mail
      case 'email_planifie': return Clock
      case 'relance_automatique': return Calendar
      default: return Target
    }
  }

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'email_immediate': return 'Email immédiat'
      case 'email_planifie': return 'Email planifié'
      case 'relance_automatique': return 'Relance automatique'
      default: return 'Action inconnue'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Workflows Simplifiés</h3>
          <p className="text-muted-foreground">Automatisations manuelles pour vos segments et projets</p>
        </div>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Workflow
        </Button>
      </div>

      {/* Liste des workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => {
          const ActionIcon = getActionIcon(workflow.type_action)
          const segment = segments.find(s => s.id === workflow.segment_id)
          const template = emailTemplates.find(t => t.id === workflow.template_id)
          
          return (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workflow.nom}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={workflow.actif ? "default" : "secondary"}>
                      {workflow.actif ? "Actif" : "Inactif"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleWorkflow(workflow)}
                    >
                      {workflow.actif ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {workflow.description && (
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Détails du workflow */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <ActionIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{getActionLabel(workflow.type_action)}</span>
                    {workflow.delai_jours && (
                      <Badge variant="outline" className="ml-2">
                        {workflow.delai_jours} jour(s)
                      </Badge>
                    )}
                  </div>
                  
                  {segment && (
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Segment: {segment.nom}</span>
                    </div>
                  )}
                  
                  {template && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Template: {template.nom}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecuteWorkflow(workflow)}
                    disabled={!workflow.actif}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Exécuter
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditWorkflow(workflow)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteWorkflow(workflow)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {workflows.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun workflow configuré</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier workflow pour automatiser vos actions sur les segments
            </p>
            <Button onClick={handleCreateWorkflow}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un workflow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal Workflow */}
      <Dialog open={isWorkflowModalOpen} onOpenChange={setIsWorkflowModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow ? 'Modifier le Workflow' : 'Nouveau Workflow'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du workflow</Label>
              <Input
                id="nom"
                value={workflowForm.nom}
                onChange={(e) => setWorkflowForm({...workflowForm, nom: e.target.value})}
                placeholder="Ex: Relance prospects non-répondeurs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm({...workflowForm, description: e.target.value})}
                placeholder="Description du workflow..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Type d'action</Label>
              <Select 
                value={workflowForm.type_action} 
                onValueChange={(value) => setWorkflowForm({...workflowForm, type_action: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_immediate">📧 Email immédiat</SelectItem>
                  <SelectItem value="email_planifie">⏰ Email planifié</SelectItem>
                  <SelectItem value="relance_automatique">🔄 Relance automatique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {workflowForm.type_action.includes('planifie') && (
              <div className="space-y-2">
                <Label htmlFor="delai">Délai en jours</Label>
                <Input
                  id="delai"
                  type="number"
                  value={workflowForm.delai_jours}
                  onChange={(e) => setWorkflowForm({...workflowForm, delai_jours: parseInt(e.target.value)})}
                  min="1"
                  max="365"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Segment cible</Label>
              <Select 
                value={workflowForm.segment_id} 
                onValueChange={(value) => setWorkflowForm({...workflowForm, segment_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un segment..." />
                </SelectTrigger>
                <SelectContent>
                  {segments.map(segment => (
                    <SelectItem key={segment.id} value={segment.id.toString()}>
                      {segment.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template email</Label>
              <Select 
                value={workflowForm.template_id} 
                onValueChange={(value) => setWorkflowForm({...workflowForm, template_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un template..." />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsWorkflowModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveWorkflow}>
                {editingWorkflow ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}