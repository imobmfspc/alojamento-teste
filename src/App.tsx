import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase/client';

// Componentes partilhados
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import LoadingSpinner from './components/shared/LoadingSpinner';
import PWAInstallButton from './components/shared/PWAInstallButton';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import QuartoDetalhesPage from './pages/public/QuartoDetalhesPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Páginas administrativas
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuartos from './pages/admin/AdminQuartos';
import AdminPropriedade from './pages/admin/AdminPropriedade';
import AdminReservas from './pages/admin/AdminReservas';

// Contexto de autenticação
import { AuthProvider } from './contexts/AuthContext';

// Componente para controlar o scroll
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [propertyName, setPropertyName] = useState<string>('Alojamento Local');

  useEffect(() => {
    // Obtém o estado da sessão atual
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Inicializa o estado da sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Buscar nome da propriedade
    const fetchPropertyName = async () => {
      const { data } = await supabase
        .from('propriedade')
        .select('nome')
        .single();
      
      if (data?.nome) {
        setPropertyName(data.nome);
        document.title = data.nome;
      }
    };

    fetchPropertyName();

    // Inscrever para atualizações em tempo real
    const propertySubscription = supabase
      .channel('propriedade_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'propriedade'
        },
        (payload) => {
          if (payload.new.nome) {
            setPropertyName(payload.new.nome);
            document.title = payload.new.nome;
          }
        }
      )
      .subscribe();

    // Cleanup na desmontagem do componente
    return () => {
      subscription.unsubscribe();
      propertySubscription.unsubscribe();
    };
  }, []);

  // Componente de proteção para rotas administrativas
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/admin/login" replace />;
    }
    return <>{children}</>;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider value={{ session }}>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className={`flex-grow ${location.pathname.startsWith('/admin') ? 'admin-page' : ''}`}>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/quarto/:id" element={<QuartoDetalhesPage />} />
              
              {/* Rotas administrativas */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/quartos" 
                element={
                  <ProtectedRoute>
                    <AdminQuartos />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/propriedade" 
                element={
                  <ProtectedRoute>
                    <AdminPropriedade />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reservas" 
                element={
                  <ProtectedRoute>
                    <AdminReservas />
                  </ProtectedRoute>
                } 
              />

              {/* Rota para página não encontrada */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <PWAInstallButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;