"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Checkbox } from "./ui/checkbox"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { supabase } from "../lib/supabase"
import { 
  Eye, Mail, Filter, Search, ChevronLeft, ChevronRight, 
  User, Building2, FileText, TrendingUp, Euro, BarChart3,
  Users, Target, Globe, Facebook, Smartphone, Send, Plus,
  UserCheck, AlertTriangle, Calendar, MessageSquare
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../hooks/use-toast"

interface Project {
  projet_id: number
  contact_id: number
  date_creation: string
  origine: string
  statut: string
  commercial: string
  contact?: {
    identifiant: number
    prenom: string
    nom: string
    email: string
    civilite: string
  }
  contrats?: {
    id: string
    contrat_produit?: string
    prime_brute_mensuelle?: number
    contrat_date_creation?: string
  }[]
}

interface EmailTemplate {
  id: number
  nom: string
  sujet: string
  contenu_html: string
  contenu_texte?: string
}

export function ProjectsTab() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // États principaux
  const [projects, setProjects] = useState<Project[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [originFilter, setOriginFilter] = useState("all")
  const [commercialFilter, setCommercialFilter] = useState("all")
  const [distinctStatuses, setDistinctStatuses] = useState<string[]>([])
  const [distinctOrigins, setDistinctOrigins] = useState<string[]>([])
  const [distinctCommercials, setDistinctCommercials] = useState<string[]>([])
  
  // Sélection multiple
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set())
  
  // Modal email groupé
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [customSubject, setCustomSubject] = useState("")
  const [customContent, setCustomContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Filtre de cible rapide
  const [targetFilter, setTargetFilter] = useState<"all" | "no_response" | "with_contract">("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadProjects(),
        loadEmailTemplates(),
        loadFilters()
      ])
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("projets")
      .select(`
        *,
        contact:contact_id (
          identifiant,
          prenom,
          nom,
          email,
          civilite
        ),
        contrats:contrats!contrats_projet_id_fkey (
          id,
          contrat_produit,
          prime_brute_mensuelle,
          contrat_date_creation
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    setProjects(data || [])
  }

  const loadEmailTemplates = async () => {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("nom", { ascending: true })

    if (error) throw error
    setEmailTemplates(data || [])
  }

  const loadFilters = async () => {
    const { data, error } = await supabase
      .from("projets")
      .select("statut, origine, commercial")
      .not("statut", "is", null)
      .not("origine", "is", null)
      .not("commercial", "is", null)

    if (error) throw error
    
    const statuses = [...new Set(data?.map(p => p.statut).filter(Boolean))] as string[]
    const origins = [...new Set(data?.map(p => p.origine).filter(Boolean))] as string[]
    const commercials = [...new Set(data?.map(p => p.commercial).filter(Boolean))] as string[]
    
    setDistinctStatuses(statuses.sort())
    setDistinctOrigins(origins.sort())
    setDistinctCommercials(commercials.sort())
  }

  const hasContract = (p: Project) => (p.contrats && p.contrats.length > 0) || p.statut?.toLowerCase().includes("contrat")

  // Projets filtrés
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = !searchTerm || 
        project.contact?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.contact?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.commercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.origine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projet_id.toString().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || 
        project.statut?.toLowerCase().includes(statusFilter.toLowerCase())

      const matchesOrigin = originFilter === "all" ||
        project.origine === originFilter

      const matchesCommercial = commercialFilter === "all" ||
        project.commercial === commercialFilter

      const statusLower = project.statut?.toLowerCase() || ""
      const matchesTarget =
        targetFilter === "all" ||
        (targetFilter === "no_response" &&
          (statusLower.includes("ne repond pas") || statusLower.includes("ne répond pas") || statusLower.includes("injoignable"))) ||
        (targetFilter === "with_contract" && hasContract(project))

      return matchesSearch && matchesStatus && matchesOrigin && matchesCommercial && matchesTarget
    })
  }, [projects, searchTerm, statusFilter, originFilter, commercialFilter, targetFilter])

  // Projets sélectionnés avec emails
  const selectedProjectsWithEmail = useMemo(() => {
    return filteredProjects.filter(p => 
      selectedProjects.has(p.projet_id) && p.contact?.email
    )
  }, [filteredProjects, selectedProjects])

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage)

  // Statistiques
  const stats = useMemo(() => {
    const total = projects.length
    const noResponse = projects.filter(p => {
      const s = p.statut?.toLowerCase() || ""
      return s.includes("ne repond pas") || s.includes("ne répond pas") || s.includes("injoignable")
    }).length
    const withEmail = projects.filter(p => p.contact?.email).length
    const devisEnvoye = projects.filter(p => p.statut?.toLowerCase().includes("devis envoyé")).length
    const contratsSignes = projects.filter(p => hasContract(p)).length

    return { total, noResponse, withEmail, devisEnvoye, contratsSignes }
  }, [projects])

  // Gestion de la sélection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const projectIds = filteredProjects
        .filter(p => p.contact?.email)
        .map(p => p.projet_id)
      setSelectedProjects(new Set(projectIds))
    } else {
      setSelectedProjects(new Set())
    }
  }

  const handleSelectProject = (projectId: number, checked: boolean) => {
    const newSelection = new Set(selectedProjects)
    if (checked) {
      newSelection.add(projectId)
    } else {
      newSelection.delete(projectId)
    }
    setSelectedProjects(newSelection)
  }

  // Envoi d'email groupé
  const handleSendGroupEmail = async () => {
    if (selectedProjectsWithEmail.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucun projet sélectionné avec email",
        variant: "destructive"
      })
      return
    }

    let emailSubject = customSubject
    let emailContent = customContent

    // Si un template est sélectionné, utiliser ses données
    if (selectedTemplateId && selectedTemplateId !== "custom") {
      const template = emailTemplates.find(t => t.id.toString() === selectedTemplateId)
      if (template) {
        emailSubject = template.sujet
        emailContent = template.contenu_html
      }
    }

    if (!emailSubject || !emailContent) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le sujet et le contenu",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)

    try {
      // Préparer les emails pour chaque projet sélectionné
      const emailPromises = selectedProjectsWithEmail.map(async (project) => {
        const contact = project.contact!
        
        // Variables de personnalisation
        const personalizedSubject = emailSubject
          .replace('{{prenom}}', contact.prenom || '')
          .replace('{{nom}}', contact.nom || '')
          .replace('{{commercial}}', project.commercial || '')

        const personalizedContent = emailContent
          .replace('{{prenom}}', contact.prenom || '')
          .replace('{{nom}}', contact.nom || '')
          .replace('{{commercial}}', project.commercial || '')
          .replace('{{civilite}}', contact.civilite || '')

        // Ajouter signature avec coordonnées Premunia
        const signature = `
          <br><br>
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
            <strong>${project.commercial || 'Équipe Premunia'}</strong><br>
            <em>Conseiller en Assurance</em><br><br>
            📧 Email: contact@premunia.com<br>
            📞 Téléphone: +33 1 23 45 67 89<br>
            🌐 Site web: <a href="https://premunia.com">www.premunia.com</a><br><br>
            <a href="https://premunia.com/book-appointment?commercial=${encodeURIComponent(project.commercial || '')}&project=${project.projet_id}" 
               style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              📅 Prendre RDV
            </a>
          </div>
        `

        const finalContent = personalizedContent + signature

        // Appeler l'Edge Function pour envoyer l'email
        return supabase.functions.invoke('send-email', {
          body: {
            to: contact.email,
            subject: personalizedSubject,
            html: finalContent,
            text: personalizedContent.replace(/<[^>]*>/g, ''),
            contact_id: contact.identifiant,
            project_id: project.projet_id,
            commercial: project.commercial
          }
        })
      })

      const results = await Promise.allSettled(emailPromises)
      
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const errorCount = results.filter(r => r.status === 'rejected').length

      if (successCount > 0) {
        toast({
          title: "Emails envoyés",
          description: `${successCount} email(s) envoyé(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`,
        })
      }

      if (errorCount === results.length) {
        toast({
          title: "Erreur",
          description: "Tous les emails ont échoué",
          variant: "destructive"
        })
      }

      // Fermer le modal et réinitialiser
      setIsEmailModalOpen(false)
      setSelectedProjects(new Set())
      setSelectedTemplateId("")
      setCustomSubject("")
      setCustomContent("")

    } catch (error) {
      console.error("Error sending emails:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi des emails",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  // Helpers pour l'affichage
  const getStatusColor = (statut: string) => {
    const statusLower = statut?.toLowerCase()
    switch (true) {
      case statusLower?.includes("ne repond pas") || statusLower?.includes("ne répond pas"):
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case statusLower?.includes("en cours"):
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case statusLower?.includes("devis envoyé"):
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case statusLower?.includes("contrat"):
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getOriginIcon = (origine: string) => {
    const originLower = origine?.toLowerCase()
    if (originLower?.includes("facebook") || originLower?.includes("fb")) return Facebook
    if (originLower?.includes("tiktok")) return Smartphone
    if (originLower?.includes("premunia")) return Globe
    return Target
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
      <div className="border-b border-border pb-6">
        <h2 className="text-3xl font-bold">Gestion des Projets</h2>
        <p className="text-muted-foreground mt-2">Suivez et gérez tous vos projets clients</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Building2 className="w-6 h-6 text-primary" />
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
            </div>
            <div className="text-sm text-muted-foreground">Total Projets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <div className="text-3xl font-bold text-orange-500">{stats.noResponse}</div>
            </div>
            <div className="text-sm text-muted-foreground">Ne Répondent Pas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FileText className="w-6 h-6 text-yellow-500" />
              <div className="text-3xl font-bold text-yellow-500">{stats.devisEnvoye}</div>
            </div>
            <div className="text-sm text-muted-foreground">Devis Envoyé</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <UserCheck className="w-6 h-6 text-green-500" />
              <div className="text-3xl font-bold text-green-500">{stats.contratsSignes}</div>
            </div>
            <div className="text-sm text-muted-foreground">Contrats Signés</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, commercial, origine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {distinctStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Origine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les origines</SelectItem>
                  {distinctOrigins.map(origin => (
                    <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={commercialFilter} onValueChange={setCommercialFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Commercial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les commerciaux</SelectItem>
                  {distinctCommercials.map(commercial => (
                    <SelectItem key={commercial} value={commercial}>{commercial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ciblage rapide senior: Ne répond pas / Avec contrat */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge 
              variant={targetFilter === "all" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setTargetFilter("all")}
            >
              Tous
            </Badge>
            <Badge 
              variant={targetFilter === "no_response" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setTargetFilter("no_response")}
            >
              Injoignables / Ne répond pas
            </Badge>
            <Badge 
              variant={targetFilter === "with_contract" ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setTargetFilter("with_contract")}
            >
              Avec contrat (Cross‑sell)
            </Badge>
          </div>

          {/* Actions de sélection */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all"
                  checked={selectedProjects.size > 0 && selectedProjectsWithEmail.length === filteredProjects.filter(p => p.contact?.email).length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">
                  Tout sélectionner ({filteredProjects.filter(p => p.contact?.email).length} avec email)
                </Label>
              </div>
              
              {selectedProjects.size > 0 && (
                <Badge variant="outline">
                  {selectedProjectsWithEmail.length} projet(s) sélectionné(s)
                </Badge>
              )}
            </div>

            {selectedProjectsWithEmail.length > 0 && (
              <Button 
                onClick={() => setIsEmailModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer Email Groupé</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedProjects.map((project) => {
          const OriginIcon = getOriginIcon(project.origine)
          const hasEmail = !!project.contact?.email
          const contracted = hasContract(project)
          
          return (
            <Card key={project.projet_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {hasEmail && (
                      <Checkbox 
                        checked={selectedProjects.has(project.projet_id)}
                        onCheckedChange={(checked) => handleSelectProject(project.projet_id, checked as boolean)}
                      />
                    )}
                    <h3 className="font-semibold text-lg">#{project.projet_id}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {contracted && <Badge className="bg-green-100 text-green-800">Contrat</Badge>}
                    <OriginIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {project.contact && (
                  <div className="space-y-2 mb-4">
                    <p className="font-medium">
                      {project.contact.civilite} {project.contact.prenom} {project.contact.nom}
                    </p>
                    {project.contact.email && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {project.contact.email}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <Badge className={getStatusColor(project.statut)}>
                    {project.statut}
                  </Badge>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-1" />
                    {project.commercial}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(project.date_creation).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/projects/${project.projet_id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  
                  {hasEmail && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProjects(new Set([project.projet_id]))
                        setIsEmailModalOpen(true)
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modal Email Groupé */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Envoyer Email Groupé</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Résumé des destinataires */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium mb-2">Destinataires :</p>
              <div className="text-sm space-y-1">
                {selectedProjectsWithEmail.slice(0, 5).map(project => (
                  <div key={project.projet_id}>
                    {project.contact?.prenom} {project.contact?.nom} - {project.contact?.email}
                  </div>
                ))}
                {selectedProjectsWithEmail.length > 5 && (
                  <div className="text-muted-foreground">
                    ... et {selectedProjectsWithEmail.length - 5} autre(s)
                  </div>
                )}
              </div>
            </div>

            {/* Choix du template */}
            <div className="space-y-3">
              <Label>Template Email</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un template ou personnaliser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">✏️ Email personnalisé</SelectItem>
                  {emailTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contenu email personnalisé ou preview template */}
            {(selectedTemplateId === "custom" || !selectedTemplateId) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Sujet de l'email..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea
                    id="content"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    placeholder="Contenu de l'email..."
                    rows={8}
                  />
                </div>
              </div>
            )}

            {selectedTemplateId && selectedTemplateId !== "custom" && (
              <div className="space-y-2">
                <Label>Aperçu du template</Label>
                {emailTemplates.find(t => t.id.toString() === selectedTemplateId) && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium mb-2">
                      {emailTemplates.find(t => t.id.toString() === selectedTemplateId)?.sujet}
                    </p>
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: emailTemplates.find(t => t.id.toString() === selectedTemplateId)?.contenu_html || ""
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Variables disponibles */}
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
              <strong>Variables disponibles :</strong> {"{{prenom}}"}, {"{{nom}}"}, {"{{civilite}}"}, {"{{commercial}}"}
              <br />
              <strong>Signature automatique :</strong> Coordonnées Premunia + lien RDV ajoutés automatiquement
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSendGroupEmail}
                disabled={isSending}
              >
                {isSending ? "Envoi..." : `Envoyer à ${selectedProjectsWithEmail.length} destinataire(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
