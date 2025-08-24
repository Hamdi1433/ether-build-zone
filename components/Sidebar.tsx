import React from 'react';
import {
  Home,
  FolderOpen,
  BarChart,
  Users,
  Mail,
  Calendar,
  Settings,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'segments', label: 'Segments', icon: Users },
    { id: 'templates', label: 'Templates Email', icon: Mail },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 border-r border-gray-200 w-64">
      <div className="px-6 py-4">
        <h1 className="text-lg font-semibold">CRM Dashboard</h1>
      </div>
      <nav className="flex-1 px-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/${item.id}`}
                className={({ isActive }) =>
                  `flex items-center space-x-2 py-2 px-4 rounded-md
                  ${isActive
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 py-4">
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
