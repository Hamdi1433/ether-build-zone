
export interface Contact {
  id?: string
  contact_id?: string
  civilite?: string
  prenom?: string
  nom?: string
  email?: string
  telephone?: string
  adresse?: string
  code_postal?: string
  ville?: string
  raison_sociale?: string
  siret?: string
  created_at?: string
  projets?: Projet[]
}

export interface Projet {
  projet_id?: string
  contact_id?: string
  type?: string
  origine?: string
  statut?: string
  commercial?: string
  notes?: string
  date_creation?: string
  contact?: Contact
}

export interface Contrat {
  id?: string
  projet_id?: string
  contact_id?: string
  contrat_statut?: string
  contrat_compagnie?: string
  contrat_produit?: string
  contrat_formule?: string
  contrat_date_creation?: string
  prime_brute_annuelle?: number
  prime_nette_annuelle?: number
  prime_brute_mensuelle?: number
  commissionnement_annee1?: number
}

export interface EmailTemplate {
  id?: string
  nom?: string
  sujet?: string
  contenu?: string
  type?: string
  created_at?: string
}

export interface Segment {
  id?: string
  nom?: string
  description?: string
  criteres?: any
  contacts_count?: number
  created_at?: string
}

export interface Campaign {
  id?: string
  nom?: string
  type?: string
  statut?: string
  template_id?: string
  segment_id?: string
  tracking_stats?: any
  created_at?: string
}

export interface Interaction {
  id?: string
  contact_id?: string
  type?: string
  message?: string
  created_at?: string
}
