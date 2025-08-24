import React from 'react'
import Sidebar from './Sidebar'
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Mail, 
  Calendar,
  Settings,
  Building2,
  Target,
  ClipboardList
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Projets', href: '/projects', icon: FolderOpen },
  { name: 'Contrats', href: '/contracts', icon: ClipboardList },
  { name: 'Entreprises', href: '/companies', icon: Building2 },
  { name: 'Pipeline', href: '/pipeline', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Templates Email', href: '/email-templates', icon: Mail },
  { name: 'Segments', href: '/segments', icon: Users },
  { name: 'Rendez-vous', href: '/appointments', icon: Calendar },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar navigation={navigation} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {title && (
          <header className="h-16 border-b bg-card px-6 flex items-center">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </header>
        )}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
