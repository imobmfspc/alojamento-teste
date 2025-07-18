import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ExternalLink, Clock8, AlarmClock } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { Link } from 'react-router-dom';

interface FooterInfo {
  sobre_footer: string;
  telefone: string;
  email: string;
  horario_checkin: string;
  horario_checkout: string;
  horario_rececao: string;
  morada: string;
  link_externo_url: string;
  link_externo_texto: string;
}

const Footer: React.FC = () => {
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchFooterInfo = async () => {
      const { data, error } = await supabase
        .from('propriedade')
        .select('sobre_footer, telefone, email, horario_checkin, horario_checkout, horario_rececao, morada, link_externo_url, link_externo_texto')
        .single();

      if (!error && data) {
        setFooterInfo(data);
      }
    };

    // Buscar dados iniciais
    fetchFooterInfo();

    // Inscrever-se para atualizações em tempo real
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
          setFooterInfo(payload.new as FooterInfo);
        }
      )
      .subscribe();

    // Cleanup na desmontagem
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <footer className="bg-gray-100 pt-12 pb-6 border-t border-gray-200">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Sobre */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sobre Nós</h3>
            <p className="text-gray-600 mb-4">
              {footerInfo?.sobre_footer || 'Oferecemos alojamento de qualidade no coração da cidade, com conforto e conveniência para tornar a sua estadia verdadeiramente memorável.'}
            </p>
          </div>

          {/* Contactos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contactos</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone size={18} className="text-gray-500 mr-2 mt-0.5" />
                <a 
                  href={`tel:${footerInfo?.telefone || '+351 123 456 789'}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {footerInfo?.telefone || '+351 123 456 789'}
                </a>
              </li>
              <li className="flex items-start">
                <Mail size={18} className="text-gray-500 mr-2 mt-0.5" />
                <a 
                  href={`mailto:${footerInfo?.email || 'info@alojamentolocal.pt'}`}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {footerInfo?.email || 'info@alojamentolocal.pt'}
                </a>
              </li>
              <li className="flex items-start">
                <MapPin size={18} className="text-gray-500 mr-2 mt-0.5" />
                <div className="text-gray-600 whitespace-pre-line">{footerInfo?.morada || 'Rua Principal, 123\n1000-000 Lisboa'}</div>
              </li>
              {footerInfo?.link_externo_url && footerInfo?.link_externo_texto && (
                <li className="flex items-start">
                  <ExternalLink size={18} className="text-gray-500 mr-2 mt-0.5" />
                  <a 
                    href={footerInfo.link_externo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {footerInfo.link_externo_texto}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Horário */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Horário</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Clock8 size={18} className="text-gray-500 mr-2 mt-0.5" />
                <div className="text-gray-600">
                  <p><span className="font-medium">Check-in:</span> {footerInfo?.horario_checkin || '14:00 - 20:00'}</p>
                  <p><span className="font-medium">Check-out:</span> {footerInfo?.horario_checkout || 'até às 11:00'}</p>
                </div>
              </li>
              <li className="flex items-start">
                <AlarmClock size={18} className="text-gray-500 mr-2 mt-0.5" />
                <div className="text-gray-600">
                  <p><span className="font-medium">Receção:</span> {footerInfo?.horario_rececao || '08:00 - 20:00'}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-600 hover:text-gray-900">Início</a></li>
              <li><a href="/#quartos" className="text-gray-600 hover:text-gray-900">Quartos</a></li>
              <li><a href="/#comodidades" className="text-gray-600 hover:text-gray-900">Comodidades</a></li>
            </ul>
          </div>
        </div>

        {/* Direitos de autor */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} Alojamento Local • <Link to="/admin/login" className="hover:text-gray-900 transition-colors">Painel Administrativo</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;