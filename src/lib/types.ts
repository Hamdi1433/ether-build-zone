
export interface Contact {
  identifiant: number;
  id?: number;
  email?: string;
  nom?: string;
  prenom?: string;
  date_creation?: string;
}

export interface Projet {
  projet_id: number;
  contact_id?: number;
  statut?: string;
  commercial?: string;
  origine?: string;
  date_creation?: string;
}

export interface Contrat {
  id: string;
  contact_id?: number;
  projet_id?: number;
  prime_brute_annuelle?: number;
  commissionnement_annee1?: number;
  contrat_date_creation?: string;
}

export interface Interaction {
  id: number;
  contact_id?: number;
  type?: string;
  canal?: string;
  created_at?: string;
}
