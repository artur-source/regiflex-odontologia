import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import { Toaster } from "@/components/ui/toaster";
import Dashboard from './components/Dashboard';
import Pacientes from './components/Pacientes';
import Sessoes from './components/Sessoes';
import QRCodeComponent from './components/QRCode';
import IA from './components/IA';
import Relatorios from './components/Relatorios';
import Odontologia from '../modules/odontologia/src/App.jsx'; // Importa o componente principal do módulo de odontologia
import Integracoes from './components/Integracoes';
import './App.css';

// Componente para páginas ainda não implementadas
const ComingSoon = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
    </div>
  </div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'pacientes':
        return <Pacientes />;
      case 'sessoes':
        return <Sessoes />;
      case 'qr':
        return <QRCodeComponent />;
      case 'relatorios':
        return <Relatorios />;
      case 'ia':
        return <IA />;
      case 'integracoes':
        return <Integracoes />;
      case 'odontologia':
        return <Odontologia />;
      case 'configuracoes':
        return <ComingSoon title="Configurações" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;

