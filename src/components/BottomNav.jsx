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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[var(--color-m3-sys-light-surface-container)] px-2 py-3 flex items-center justify-around z-40 animate-slide-up border-t border-[var(--color-m3-sys-light-surface-container-high)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        if (tab.isAction) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative -top-6 w-14 h-14 bg-[var(--color-m3-sys-light-primary)] rounded-[1rem] flex items-center justify-center text-[var(--color-m3-sys-light-on-primary)] hover:scale-105 hover:bg-[var(--color-m3-sys-light-primary-container)] hover:text-[var(--color-m3-sys-light-on-primary-container)] transition-all shadow-md"
            >
              <Icon size={28} strokeWidth={2} />
            </button>
          );
        }

        return (
            <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center gap-1 w-16 h-14"
          >
            <div className={clsx(
              "flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300",
              isActive ? "bg-[var(--color-m3-sys-light-secondary-container)] text-[var(--color-m3-sys-light-on-secondary-container)]" : "text-[var(--color-m3-sys-light-on-surface-variant)] hover:bg-[var(--color-m3-sys-light-surface-container-high)]"
            )}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            {/* Optional label can go here */}
          </button>
        );
      })}
    </div>
  );
}
