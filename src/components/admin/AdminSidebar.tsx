import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Bed, Mail, Settings, LogOut, Home } from 'lucide-react';
import { supabase } from '../../supabase/client';

interface AdminSidebarProps {
  activeItem: 'dashboard' | 'quartos' | 'reservas' | 'propriedade';
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeItem }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin'
    },
    {
      id: 'quartos',
      label: 'Quartos',
      icon: <Bed size={20} />,
      path: '/admin/quartos'
    },
    {
      id: 'reservas',
      label: 'Reservas',
      icon: <Mail size={20} />,
      path: '/admin/reservas'
    },
    {
      id: 'propriedade',
      label: 'Propriedade',
      icon: <Settings size={20} />,
      path: '/admin/propriedade'
    }
  ];

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-lg">Área Administrativa</h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link 
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  activeItem === item.id 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-1">
          <li>
            <Link 
              to="/"
              className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Home size={20} className="mr-3" />
              <span>Ver Site</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={handleSignOut}
              className="flex w-full items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              <span>Terminar Sessão</span>
            </button>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AdminSidebar;