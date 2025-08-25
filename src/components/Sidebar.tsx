
import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  BarChart3,
  Users,
  Target,
  Mail,
  Settings,
  Home,
  FormInput
} from 'lucide-react'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Génération de Leads', href: '/lead-generation', icon: Target },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-white">CRM Pro</h1>
        </div>
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )
                }
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
