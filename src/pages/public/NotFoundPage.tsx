import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
      <div className="container-custom max-w-lg text-center py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
          <p className="text-gray-600 mb-2">
            Lamentamos, mas a página que procura não existe ou foi removida.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Será redirecionado para a página inicial em {countdown} {countdown === 1 ? 'segundo' : 'segundos'}...
          </p>
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center"
          >
            <Home size={18} className="mr-2" />
            Voltar à página inicial
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;