import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './components/LoginScreen';
import Universe3D from './components/Universe3D';
import TreinoModule from './components/modules/TreinoModule';
import CardioModule from './components/modules/CardioModule';
import HistoricoModule from './components/modules/HistoricoModule';
import NutricaoModule from './components/modules/NutricaoModule';
import PerfilModule from './components/modules/PerfilModule';
import { initializeDB } from './db/database';

type Screen = 'login' | 'universe' | 'treino' | 'cardio' | 'historico' | 'nutricao' | 'perfil';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeDB().then(() => setDbReady(true));
    const session = localStorage.getItem('enzo_session');
    if (session === 'authenticated') {
      setScreen('universe');
    }
  }, []);

  const handleLogin = () => {
    setScreen('universe');
  };

  const handleLogout = () => {
    setScreen('login');
  };

  const handleModuleSelect = (moduleId: string) => {
    setScreen(moduleId as Screen);
  };

  const handleBack = () => {
    setScreen('universe');
  };

  if (!dbReady && screen !== 'login') {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00BFFF', borderTopColor: 'transparent' }} />
          <p className="font-dm text-sm" style={{ color: '#555' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#0A0A0A' }}>
      <AnimatePresence mode="wait">
        {screen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0"
          >
            <LoginScreen onLogin={handleLogin} />
          </motion.div>
        )}

        {screen === 'universe' && (
          <motion.div
            key="universe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0"
          >
            <Universe3D onModuleSelect={handleModuleSelect} />
          </motion.div>
        )}

        {screen === 'treino' && (
          <motion.div
            key="treino"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 module-screen"
          >
            <TreinoModule onBack={handleBack} />
          </motion.div>
        )}

        {screen === 'cardio' && (
          <motion.div
            key="cardio"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 module-screen"
          >
            <CardioModule onBack={handleBack} />
          </motion.div>
        )}

        {screen === 'historico' && (
          <motion.div
            key="historico"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 module-screen"
          >
            <HistoricoModule onBack={handleBack} />
          </motion.div>
        )}

        {screen === 'nutricao' && (
          <motion.div
            key="nutricao"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 module-screen"
          >
            <NutricaoModule onBack={handleBack} />
          </motion.div>
        )}

        {screen === 'perfil' && (
          <motion.div
            key="perfil"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 module-screen"
          >
            <PerfilModule onBack={handleBack} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
