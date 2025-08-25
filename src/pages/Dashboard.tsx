
import React from 'react'
import { useAuth } from '../../components/auth-provider'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { DashboardTab } from '../components/DashboardTab'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div>Chargement...</div>

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <Layout title="Tableau de Bord">
      <DashboardTab />
    </Layout>
  )
}
