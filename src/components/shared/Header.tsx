import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MapPinHouse, User, LogOut, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/client';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const [contactInfo, setContactInfo] = useState({
    telefone: '+351 123 456 789',
    email: 'info@alojamentolocal.pt'
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    // Fetch contact info
    const fetchContactInfo = async () => {
      const { data } = await supabase
        .from('propriedade')
        .select('telefone, email')
        .single();
      
      if (data) {
        setContactInfo(data);
      }
    };

    fetchContactInfo();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('propriedade_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'propriedade'
        },
        (payload) => {
          if (payload.new.telefone || payload.new.email) {
            setContactInfo({
              telefone: payload.new.telefone || contactInfo.telefone,
              email: payload.new.email || contactInfo.email
            });
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = isAdmin ? 64 : 96;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      closeMenu();
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled || isAdmin || location.pathname !== '/' 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      {/* Top Bar - Only visible on desktop and when not in admin */}
      {!isAdmin && (
        <div className={`hidden lg:block border-b transition-all duration-500 ${
          isScrolled || location.pathname !== '/' 
            ? 'border-gray-200 bg-gray-50/50' 
            : 'border-white/10'
        }`}>
          <div className="container-custom py-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-6">
                <a 
                  href={`tel:${contactInfo.telefone}`}
                  className={`flex items-center transition-colors duration-500 ${
                    isScrolled || location.pathname !== '/' 
                      ? 'text-gray-600 hover:text-gray-900' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Phone size={14} className="mr-1" />
                  <span>{contactInfo.telefone}</span>
                </a>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className={`flex items-center transition-colors duration-500 ${
                    isScrolled || location.pathname !== '/' 
                      ? 'text-gray-600 hover:text-gray-900' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Mail size={14} className="mr-1" />
                  <span>{contactInfo.email}</span>
                </a>
              </div>
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/admin" 
                    className={`transition-colors duration-500 ${
                      isScrolled || location.pathname !== '/' 
                        ? 'text-gray-600 hover:text-gray-900' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Painel Admin
                  </Link>
                  <button 
                    onClick={handleSignOut} 
                    className={`transition-colors duration-500 ${
                      isScrolled || location.pathname !== '/' 
                        ? 'text-gray-600 hover:text-gray-900' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Terminar Sessão
                  </button>
                </div>
              ) : (
                <Link 
                  to="/admin/login" 
                  className={`transition-colors duration-500 ${
                    isScrolled || location.pathname !== '/' 
                      ? 'text-gray-600 hover:text-gray-900' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Área Administrativa
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className={`transition-all duration-500 ${
        isAdmin ? 'py-3' : (isScrolled ? 'py-4' : 'py-6')
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center group"
              onClick={closeMenu}
            >
              <MapPinHouse className={`w-8 h-8 transition-all duration-500 ${
                isScrolled || isAdmin || location.pathname !== '/' 
                  ? 'text-gray-900' 
                  : 'text-white'
              }`} />
              <div className={`ml-3 transition-all duration-500 ${
                isScrolled || isAdmin || location.pathname !== '/' 
                  ? 'text-gray-900' 
                  : 'text-white'
              }`}>
                <div className="text-xl font-bold tracking-tight">Lobi • Alojamento</div>
                <div className="text-xs font-medium opacity-80">Conforto & Qualidade</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors duration-300 ${
                  location.pathname === '/' 
                    ? isScrolled || isAdmin ? 'text-gray-900' : 'text-white' 
                    : isScrolled || isAdmin ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                }`}
                onClick={closeMenu}
              >
                Início
              </Link>
              
              {location.pathname === '/' && (
                <>
                  <a 
                    href="#quartos"
                    className={`font-medium transition-colors duration-300 ${
                      isScrolled || isAdmin ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                    }`}
                    onClick={(e) => scrollToSection(e, 'quartos')}
                  >
                    Quartos
                  </a>
                  
                  <a 
                    href="#comodidades"
                    className={`font-medium transition-colors duration-300 ${
                      isScrolled || isAdmin ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                    }`}
                    onClick={(e) => scrollToSection(e, 'comodidades')}
                  >
                    Comodidades
                  </a>
                </>
              )}

              {/* Admin Navigation */}
              {session && !isAdmin && (
                <Link 
                  to="/admin"
                  className={`font-medium transition-colors duration-300 ${
                    isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Painel Admin
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              onClick={toggleMenu}
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isOpen ? (
                <X size={28} className={
                  isScrolled || isAdmin || location.pathname !== '/' 
                    ? 'text-gray-900' 
                    : 'text-white'
                } />
              ) : (
                <Menu size={28} className={
                  isScrolled || isAdmin || location.pathname !== '/' 
                    ? 'text-gray-900' 
                    : 'text-white'
                } />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="container-custom py-6">
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className={`text-lg font-medium ${
                    location.pathname === '/' ? 'text-gray-900' : 'text-gray-600'
                  }`}
                  onClick={closeMenu}
                >
                  Início
                </Link>
                
                {location.pathname === '/' && (
                  <>
                    <a 
                      href="#quartos" 
                      className="text-lg font-medium text-gray-600"
                      onClick={(e) => scrollToSection(e, 'quartos')}
                    >
                      Quartos
                    </a>
                    
                    <a 
                      href="#comodidades" 
                      className="text-lg font-medium text-gray-600"
                      onClick={(e) => scrollToSection(e, 'comodidades')}
                    >
                      Comodidades
                    </a>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200">
                  {session ? (
                    <div className="flex flex-col space-y-3">
                      <Link 
                        to="/admin" 
                        className="btn-secondary text-base w-full justify-center"
                        onClick={closeMenu}
                      >
                        Painel Admin
                      </Link>
                      <button 
                        onClick={() => {
                          handleSignOut();
                          closeMenu();
                        }}
                        className="btn-primary text-base w-full justify-center"
                      >
                        Terminar Sessão
                      </button>
                    </div>
                  ) : (
                    <Link 
                      to="/admin/login" 
                      className="btn-primary text-base w-full justify-center"
                      onClick={closeMenu}
                    >
                      <User size={18} className="mr-2" />
                      Área Administrativa
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;