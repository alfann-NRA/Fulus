import { BookOpen, Megaphone, Moon, Unlock } from 'lucide-react';

export default function Header({ isProMode, onUnlockClick }) {
  return (
    <header className="flex items-center justify-between px-5 pt-10 pb-4 bg-[var(--color-m3-sys-light-surface-container)] sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--color-m3-sys-light-primary)] rounded-full flex items-center justify-center font-black text-[var(--color-m3-sys-light-on-primary)] text-xl">
          F.
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-[var(--color-m3-sys-light-on-surface)]">Fulus</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-m3-sys-light-on-surface-variant)] hover:bg-[var(--color-m3-sys-light-surface-container-high)] transition-colors">
          <BookOpen size={24} strokeWidth={2} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-m3-sys-light-on-surface-variant)] hover:bg-[var(--color-m3-sys-light-surface-container-high)] transition-colors relative">
          <Megaphone size={24} strokeWidth={2} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--color-m3-sys-light-surface-container)]"></span>
        </button>
        {!isProMode ? (
          <button 
            onClick={onUnlockClick}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-m3-sys-light-on-surface-variant)] hover:bg-[var(--color-m3-sys-light-surface-container-high)] transition-colors"
          >
            <Unlock size={22} strokeWidth={2} />
          </button>
        ) : (
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-m3-sys-light-on-surface-variant)] hover:bg-[var(--color-m3-sys-light-surface-container-high)] transition-colors">
            <Moon size={24} strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
