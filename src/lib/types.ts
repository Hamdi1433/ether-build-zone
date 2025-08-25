
// Types pour le CRM - Version complète

export interface Contact {
  identifiant: number;
  id?: number;
  civilite?: string;
  prenom?: string;
  nom?: string;
  raison_sociale?: string;
  siret?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  // Propriétés étendues
  statut?: string;
  type?: string;
  notes?: string;
  date_creation?: string;
  engagement_score?: number;
  last_contact_date?: string;
  assigned_to?: string;
  source?: string;
  // Relations calculées
  projets?: Projet[];
  contrats?: Contrat[];
  interactions?: Interaction[];
  revenue?: number;
  lastInteraction?: string;
}

export interface Projet {
  id?: string | number;
  projet_id: number;
  contact_id?: number;
  date_creation?: string;
  origine?: string;
  statut?: string;
  commercial?: string;
  date_souscription?: string;
  contrat?: boolean;
  created_at?: string;
  updated_at?: string;
  // Propriétés étendues
  type?: string;
  notes?: string;
  priorite?: 'low' | 'medium' | 'high';
  valeur_estimee?: number;
  probabilite?: number;
  date_cloture_prevue?: string;
  etapes_completees?: string[];
  // Relations
  contact?: Contact;
  contrats?: Contrat[];
}

export interface Contrat {
  id: string;
  contact_id?: number;
  projet_id?: number;
  contrat_num_contrat?: string;
  contrat_produit?: string;
  contrat_formule?: string;
  contrat_compagnie?: string;
  contrat_statut?: string;
  // Dates
  contrat_date_creation?: string;
  contrat_debut_effet?: string;
  contrat_date_echeance?: string;
  contrat_debut_signature?: string;
  contrat_demande_resiliation?: string;
  contrat_fin_contrat?: string;
  // Financier
  prime_brute_mensuelle?: number;
  prime_nette_mensuelle?: number;
  prime_brute_annuelle?: number;
  prime_nette_annuelle?: number;
  frais_honoraires?: number;
  commissionnement_annee1?: number;
  commissionnement_autres_annees?: number;
  nb_mois_gratuits_annee1?: number;
  nb_mois_gratuits_annee2?: number;
  nb_mois_gratuits_annee3?: number;
  type_commissionnement?: string;
  // Autres
  contrat_options?: string;
  contrat_commentaire?: string;
  contrat_motif_resiliation?: string;
  fractionnement?: string;
  // Propriétés étendues
  taux_commission?: number;
  marge_beneficiaire?: number;
  cout_acquisition?: number;
  valeur_vie_client?: number;
}

export interface Segment {
  id: number;
  nom: string;
  description?: string;
  criteres: Record<string, any>;
  couleur?: string;
  created_at?: string;
  type_segment?: string;
  statut_projet?: string;
  conditions?: Record<string, any>;
  // Propriétés étendues
  taille?: number;
  croissance?: number;
  conversion_rate?: number;
  valeur_moyenne?: number;
  actif?: boolean;
  derniere_mise_a_jour?: string;
}

export interface EmailTemplate {
  id: number;
  nom: string;
  sujet: string;
  contenu_html: string;
  contenu_texte?: string;
  variables?: Record<string, any>;
  categorie?: string;
  statut?: string;
  created_at?: string;
  updated_at?: string;
  // Propriétés étendues
  utilisation_count?: number;
  taux_ouverture?: number;
  taux_clic?: number;
  performance_score?: number;
  created_by?: string;
  tags?: string[];
}

export interface Workflow {
  id: number;
  nom?: string;
  description?: string;
  declencheur?: string;
  etapes?: Record<string, any>;
  statut?: string;
  segment_id?: number;
  template_id?: number;
  actif?: boolean;
  created_at?: string;
  // Propriétés étendues
  type_declencheur?: string;
  conditions_declenchement?: Record<string, any>;
  actions?: Record<string, any>[];
  frequence?: string;
  derniere_execution?: string;
  prochaine_execution?: string;
  taux_succes?: number;
  executions_totales?: number;
}

export interface Campaign {
  id: number;
  nom: string;
  description?: string;
  segment_id?: number;
  template_id?: number;
  statut?: string;
  date_lancement?: string;
  date_fin?: string;
  date_planifiee?: string;
  email_config_id?: number;
  contact_count?: number;
  tracking_stats?: {
    envois: number;
    ouvertures: number;
    clics: number;
    bounces: number;
    desabonnements: number;
    plaintes: number;
  };
  created_at?: string;
  // Propriétés étendues
  budget?: number;
  cout_par_contact?: number;
  roi?: number;
  objectif?: string;
  kpis?: Record<string, number>;
  canal?: string;
  priorite?: 'low' | 'medium' | 'high';
}

export interface Interaction {
  id: number;
  contact_id?: number;
  created_at?: string;
  type?: string;
  canal?: string;
  sujet?: string;
  message?: string;
  statut?: string;
  workflow_name?: string;
  segment_name?: string;
  // Propriétés étendues
  duree?: number;
  resultat?: string;
  prochaine_action?: string;
  commercial_id?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  engagement_score?: number;
  conversion_probability?: number;
}

export interface CRMStats {
  totalContacts: number;
  activeClients: number;
  prospects: number;
  totalRevenue: number;
  conversionRate: string;
  avgRevenuePerClient: string;
  growthRate: string;
  activeCampaigns: number;
  crossSellOpportunities: number;
  aiScore: number;
  // Stats étendues
  monthlyGrowth: number;
  churnRate: number;
  customerLifetimeValue: number;
  acquisitionCost: number;
  pipelineValue: number;
  forecastAccuracy: number;
}

export interface AnalyticsData {
  trends: any[];
  segmentPerformance: Record<string, any>;
  topCampaigns: any[];
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalCampaigns: number;
    activeCampaigns: number;
    emailsSent: number;
    openRate: string;
    clickRate: string;
    conversionRate: string;
    roi: number;
    // Métriques étendues
    avgDealSize: number;
    salesCycleLength: number;
    leadQualityScore: number;
    customerSatisfaction: number;
  };
  aiInsights: AIInsight[];
}

export interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  action_items: string[];
  created_at: string;
  expires_at?: string;
  status: 'active' | 'dismissed' | 'completed';
}

export interface Commercial {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  statut: 'actif' | 'inactif';
  equipe?: string;
  manager_id?: string;
  objectifs: {
    mensuel: number;
    annuel: number;
    contrats: number;
  };
  performance: {
    ca_realise: number;
    contrats_signes: number;
    taux_conversion: number;
    score_performance: number;
  };
  created_at: string;
}

export interface Product {
  id: string;
  nom: string;
  categorie: string;
  compagnie: string;
  description?: string;
  prix_base: number;
  commission_taux: number;
  statut: 'actif' | 'inactif' | 'suspendu';
  caracteristiques: Record<string, any>;
  created_at: string;
}

// Types pour les filtres et recherches
export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  commercial?: string[];
  product?: string[];
  company?: string[];
  source?: string[];
}

export interface SearchCriteria {
  query?: string;
  filters?: FilterOptions;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

// Types pour les rapports
export interface ReportConfig {
  id: string;
  nom: string;
  type: 'commercial' | 'financial' | 'operational';
  frequence: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  destinataires: string[];
  format: 'pdf' | 'excel' | 'csv';
  parametres: Record<string, any>;
  actif: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text';
  title: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  visible: boolean;
}
