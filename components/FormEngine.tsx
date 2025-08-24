import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ChevronLeft, ChevronRight, Check, Phone, Mail, Calendar, MapPin, Shield, AlertCircle, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../hooks/use-toast'

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'checkbox' | 'radio'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    pattern?: string
    min?: number
    max?: number
    message?: string
  }
}

interface FormStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface FormSubmission {
  id: string
  form_id: string
  contact_id?: string
  payload: Record<string, any>
  status: 'partial' | 'submitted' | 'qualified'
  utm: Record<string, any>
  jwt_claims?: Record<string, any>
  created_at: string
}

interface FormEngineProps {
  formId?: string
  pageSlug?: string
  utmParams?: Record<string, any>
  jwtClaims?: Record<string, any>
  onSubmitSuccess?: (submission: FormSubmission) => void
}

const defaultFormSteps: FormStep[] = [
  {
    id: 'step-1',
    title: 'Vos informations',
    description: 'Quelques détails pour personnaliser votre devis',
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
          message: 'Veuillez saisir un email valide'
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
          message: 'Veuillez saisir un numéro français valide'
        }
      }
    ]
  },
  {
    id: 'step-2',
    title: 'Votre situation',
    description: 'Pour vous proposer les meilleures garanties',
    fields: [
      {
        id: 'age',
        type: 'select',
        label: 'Votre âge',
        required: true,
        options: [
          '18-25 ans',
          '26-35 ans',
          '36-45 ans',
          '46-55 ans',
          '56-65 ans',
          'Plus de 65 ans'
        ]
      },
      {
        id: 'code_postal',
        type: 'text',
        label: 'Code postal',
        placeholder: '75001',
        required: true,
        validation: {
          pattern: '^\\d{5}$',
          message: 'Code postal invalide (5 chiffres)'
        }
      },
      {
        id: 'situation',
        type: 'select',
        label: 'Situation professionnelle',
        required: true,
        options: [
          'Salarié(e)',
          'Indépendant(e)',
          'Fonctionnaire',
          'Demandeur d\'emploi',
          'Retraité(e)',
          'Étudiant(e)'
        ]
      },
      {
        id: 'mutuelle_actuelle',
        type: 'select',
        label: 'Avez-vous une mutuelle actuellement ?',
        required: true,
        options: [
          'Oui, j\'ai une mutuelle',
          'Non, aucune mutuelle',
          'Je ne sais pas'
        ]
      }
    ]
  },
  {
    id: 'step-3',
    title: 'Vos besoins',
    description: 'Dernière étape pour votre devis personnalisé',
    fields: [
      {
        id: 'garanties',
        type: 'checkbox',
        label: 'Garanties importantes pour vous',
        required: true,
        options: [
          'Optique (lunettes, lentilles)',
          'Dentaire (soins, prothèses)',
          'Hospitalisation',
          'Médecines douces',
          'Maternité'
        ]
      },
      {
        id: 'budget',
        type: 'select',
        label: 'Budget mensuel souhaité',
        required: true,
        options: [
          'Moins de 30€',
          '30€ - 50€',
          '50€ - 80€',
          '80€ - 120€',
          'Plus de 120€'
        ]
      },
      {
        id: 'delai',
        type: 'select',
        label: 'Quand souhaitez-vous souscrire ?',
        required: true,
        options: [
          'Immédiatement',
          'Dans le mois',
          'Dans les 3 mois',
          'Je réfléchis encore'
        ]
      }
    ]
  }
]

export function FormEngine({ 
  formId = 'default-form',
  pageSlug,
  utmParams = {},
  jwtClaims = {},
  onSubmitSuccess
}: FormEngineProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [consents, setConsents] = useState({
    marketing: false,
    phone: false,
    email: true,
    sms: false,
    partners: false
  })
  const { toast } = useToast()

  const steps = defaultFormSteps
  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Ajout: éviter l'exécution multiple (boucle infinie)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    // Pré-remplissage via JWT si fourni
    if (jwtClaims) {
      const prefilledData: Record<string, any> = {}
      if ((jwtClaims as any).email) prefilledData.email = (jwtClaims as any).email
      if ((jwtClaims as any).phone) prefilledData.telephone = (jwtClaims as any).phone
      if ((jwtClaims as any).first_name) prefilledData.prenom = (jwtClaims as any).first_name
      if ((jwtClaims as any).last_name) prefilledData.nom = (jwtClaims as any).last_name
      if (Object.keys(prefilledData).length > 0) {
        setFormData(prev => ({ ...prefilledData, ...prev }))
      }
    }

    // Track form started (une seule fois)
    trackEvent('form_started', {
      form_id: formId,
      page_slug: pageSlug,
      utm: utmParams
    })
  }, []) // exécuté une seule fois

  const trackEvent = async (eventName: string, properties: Record<string, any>) => {
    try {
      console.info('Track event:', eventName, properties)
    } catch (error) {
      console.error('Erreur tracking:', error)
    }
  }

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} est requis`
    }

    if (field.validation && value) {
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern)
        if (!regex.test(value)) {
          return field.validation.message || `Format incorrect pour ${field.label}`
        }
      }
      
      if (field.validation.min && value.length < field.validation.min) {
        return `${field.label} doit contenir au moins ${field.validation.min} caractères`
      }
      
      if (field.validation.max && value.length > field.validation.max) {
        return `${field.label} doit contenir au maximum ${field.validation.max} caractères`
      }
    }

    return null
  }

  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex]
    const stepErrors: Record<string, string> = {}
    let isValid = true

    step.fields.forEach(field => {
      const error = validateField(field, formData[field.id])
      if (error) {
        stepErrors[field.id] = error
        isValid = false
      }
    })

    setErrors(stepErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Track step completed
      trackEvent('step_completed', {
        form_id: formId,
        step: currentStep + 1,
        step_title: steps[currentStep].title,
        payload: formData
      })

      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)

    try {
      // Créer le contact
      const contactData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        code_postal: formData.code_postal,
        civilite: 'M.', // À déterminer ou demander
      }

      const { data: contactResult, error: contactError } = await supabase
        .from('contact')
        .insert([contactData])
        .select()
        .single()

      if (contactError) throw contactError

      // Enregistrer les consentements
      const consentData = []
      if (consents.marketing) {
        consentData.push({
          contact_id: contactResult.identifiant,
          purpose: 'marketing',
          channel: 'email',
          lawful_basis: 'consent',
          text: 'J\'accepte de recevoir des offres commerciales par email',
          granted: true,
          ip: null, // À récupérer côté client
          user_agent: navigator.userAgent
        })
      }

      if (consents.phone) {
        consentData.push({
          contact_id: contactResult.identifiant,
          purpose: 'marketing',
          channel: 'phone',
          lawful_basis: 'consent',
          text: 'J\'accepte d\'être contacté par téléphone',
          granted: true,
          ip: null,
          user_agent: navigator.userAgent
        })
      }

      // Note: Besoin de créer la table consents
      // await supabase.from('consents').insert(consentData)

      // Créer le projet
      const projetData = {
        contact_id: contactResult.identifiant,
        origine: utmParams.utm_source || 'landing-page',
        provenance: pageSlug || 'unknown',
        statut: 'nouveau',
        type: 'mutuelle_sante',
        attribution: utmParams.utm_campaign || 'default',
        date_creation: new Date().toISOString(),
        commercial: 'Auto-Lead'
      }

      const { data: projetResult, error: projetError } = await supabase
        .from('projets')
        .insert([projetData])
        .select()
        .single()

      if (projetError) throw projetError

      // Enregistrer la soumission complète
      const submission: Partial<FormSubmission> = {
        form_id: formId,
        contact_id: contactResult.identifiant.toString(),
        payload: formData,
        status: 'submitted',
        utm: utmParams,
        jwt_claims: jwtClaims
      }

      // Track conversion
      trackEvent('form_submitted', {
        form_id: formId,
        contact_id: contactResult.identifiant,
        projet_id: projetResult.projet_id,
        utm: utmParams
      })

      trackEvent('consent_granted', {
        contact_id: contactResult.identifiant,
        purposes: Object.keys(consents).filter(key => consents[key as keyof typeof consents])
      })

      toast({
        title: "Demande envoyée !",
        description: "Nous vous contacterons dans les plus brefs délais.",
      })

      if (onSubmitSuccess) {
        onSubmitSuccess(submission as FormSubmission)
      }

    } catch (error) {
      console.error('Erreur soumission:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select 
              value={value || undefined}
              onValueChange={(v) => updateFormData(field.id, v)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choisissez..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || []
                      if (checked) {
                        updateFormData(field.id, [...currentValues, option])
                      } else {
                        updateFormData(field.id, currentValues.filter((v: string) => v !== option))
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-blue-600" />
                {currentStepData.title}
              </CardTitle>
              {currentStepData.description && (
                <CardDescription className="mt-1">
                  {currentStepData.description}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline">
              Étape {currentStep + 1} / {totalSteps}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {currentStepData.fields.map((field) => (
              <div key={field.id}>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Consentements (dernière étape) */}
          {currentStep === totalSteps - 1 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Consentements & RGPD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent-contract"
                      checked={true}
                      disabled
                    />
                    <Label htmlFor="consent-contract" className="text-sm leading-relaxed">
                      <strong>J'accepte</strong> le traitement de mes données pour l'étude de ma demande 
                      de devis mutuelle santé (base légale : exécution d'un contrat).
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent-marketing"
                      checked={consents.marketing}
                      onCheckedChange={(checked) => 
                        setConsents(prev => ({ ...prev, marketing: !!checked }))
                      }
                    />
                    <Label htmlFor="consent-marketing" className="text-sm leading-relaxed">
                      J'accepte de recevoir des offres commerciales personnalisées par email.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent-phone"
                      checked={consents.phone}
                      onCheckedChange={(checked) => 
                        setConsents(prev => ({ ...prev, phone: !!checked }))
                      }
                    />
                    <Label htmlFor="consent-phone" className="text-sm leading-relaxed">
                      J'accepte d'être contacté par téléphone par Premunia ou ses partenaires.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent-partners"
                      checked={consents.partners}
                      onCheckedChange={(checked) => 
                        setConsents(prev => ({ ...prev, partners: !!checked }))
                      }
                    />
                    <Label htmlFor="consent-partners" className="text-sm leading-relaxed">
                      J'accepte que mes données soient partagées avec nos partenaires assureurs.
                    </Label>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Vous pouvez retirer votre consentement à tout moment. 
                  Consultez notre <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a>.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boutons navigation */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : currentStep === totalSteps - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Envoyer ma demande
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
