
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { CommercialAnalytics } from '../../components/CommercialAnalytics'
import { supabase } from '../lib/supabase'
import type { Contact, Projet, Contrat } from '../../lib/types'

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projets, setProjets] = useState<Projet[]>([])
  const [contrats, setContrats] = useState<Contrat[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  if (loading) return null

  if (!user) {
    navigate('/login')
    return null
  }

  const loadData = async () => {
    try {
      const [
        { data: contactsData },
        { data: projetsData },
        { data: contratsData }
      ] = await Promise.all([
        supabase.from('contact').select('*').order('created_at', { ascending: false }),
        supabase.from('projets').select('*').order('created_at', { ascending: false }),
        supabase.from('contrats').select('*').order('contrat_date_creation', { ascending: false })
      ])
      
      setContacts(contactsData || [])
      setProjets(projetsData || [])
      setContrats(contratsData || [])
    } catch (error) {
      console.error('Error loading analytics data:', error)
    }
  }

  return (
    <Layout title="Analytics Commerciale">
      <CommercialAnalytics 
        contacts={contacts} 
        projets={projets} 
        contrats={contrats} 
      />
    </Layout>
  )
}
