import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  QrCode, 
  FileText, 
  Brain,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import regiflexLogo from '../assets/regiflex-logo.jpg';

const Layout = ({ children, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'sessoes', label: 'Sessões', icon: Calendar },
    { id: 'qr', label: 'QR Code', icon: QrCode },
    { id: 'relatorios', label: 'Relatórios Inteligentes', icon: FileText },
    { id: 'ia', label: 'IA & Alertas', icon: Brain },
    { id: 'integracoes', label: 'Integrações', icon: Settings },
    { id: 'odontologia', label: 'Módulo Odontologia', icon: Settings },
  ];

  // Adicionar configurações apenas para admin
  if (user?.role === 'admin') {
    menuItems.push({ id: 'configuracoes', label: 'Configurações', icon: Settings });
  }

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (user) => {
    if (!user?.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      psicologo: 'Psicólogo',
      recepcionista: 'Recepcionista'
    };
    return roles[role] || role;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <img 
                src={regiflexLogo} 
                alt="RegiFlex" 
                className="h-8 w-8 rounded object-cover"
              />
              <span className="text-xl font-bold text-gray-900">RegiFlex</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? 'gradient-regiflex text-white hover:opacity-90' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="gradient-regiflex text-white font-semibold">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <h1 className="text-lg font-semibold text-gray-900 ml-4 lg:ml-0">
                {menuItems.find(item => item.id === currentPage)?.label || 'RegiFlex'}
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
