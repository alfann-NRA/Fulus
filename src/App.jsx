import { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Scan from './pages/Scan';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isProMode, setIsProMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const handleUnlock = (pin) => {
    if (pin === '123456') { // Mock PIN
      setIsProMode(true);
      setShowPinModal(false);
    } else {
      alert('PIN Salah');
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home isProMode={isProMode} />;
      case 'wallet':
        return <Wallet isProMode={isProMode} />;
      case 'scan':
        return <Scan isProMode={isProMode} />;
      case 'transactions':
        return <Transactions isProMode={isProMode} />;
      case 'budget':
        return <Budget isProMode={isProMode} />;
      default:
        return <Home isProMode={isProMode} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden pb-24">
      <Header isProMode={isProMode} onUnlockClick={() => setShowPinModal(true)} />
      
      <main className="px-5 pt-4">
        {renderPage()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Buka Fitur Pro</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Masukkan PIN rahasia untuk unlock fitur AI & Aset (PIN Demo: 123456)</p>
            <input 
              type="password" 
              maxLength={6}
              className="w-full text-center text-2xl tracking-[0.5em] font-bold py-3 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-brand focus:ring-4 focus:ring-brand/20 outline-none transition-all mb-4"
              placeholder="••••••"
              onChange={(e) => {
                if(e.target.value.length === 6) {
                  handleUnlock(e.target.value);
                }
              }}
            />
            <button 
              onClick={() => setShowPinModal(false)}
              className="w-full py-3 font-semibold text-slate-500 hover:text-slate-700"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
