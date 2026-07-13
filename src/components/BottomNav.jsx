import { LayoutDashboard, Wallet, Plus, ArrowRightLeft, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', icon: LayoutDashboard },
    { id: 'wallet', icon: Wallet },
    { id: 'scan', icon: Plus, isAction: true },
    { id: 'transactions', icon: ArrowRightLeft },
    { id: 'budget', icon: User }, // using user for now, or maybe adjust icons
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm glass-card rounded-[2rem] px-6 py-4 flex items-center justify-between z-40 animate-slide-up">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        if (tab.isAction) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative -top-8 w-16 h-16 bg-gradient-to-br from-brand to-brand-accent rounded-full flex items-center justify-center shadow-lg shadow-brand/40 text-white hover:scale-110 transition-transform animate-float"
            >
              <Icon size={32} strokeWidth={2.5} />
            </button>
          );
        }

        return (
            <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
              isActive ? "text-brand bg-brand/10 scale-110 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
}
