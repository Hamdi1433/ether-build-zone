
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
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

interface SidebarProps {
  navigation: Array<{
    name: string
    href: string
    icon: React.ComponentType<any>
  }>
}

export function Sidebar({ navigation }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-foreground">CRM Pro</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
