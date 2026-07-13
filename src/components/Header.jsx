import { BookOpen, Megaphone, Moon, Unlock } from 'lucide-react';

export default function Header({ isProMode, onUnlockClick }) {
  return (
    <header className="flex items-center justify-between px-5 pt-8 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-bold text-slate-800 text-lg">
          B.
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Budggt.</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-700 transition-colors">
          <BookOpen size={20} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-700 transition-colors relative">
          <Megaphone size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50"></span>
        </button>
        {!isProMode ? (
          <button 
            onClick={onUnlockClick}
            className="w-10 h-10 flex items-center justify-center bg-brand/20 hover:bg-brand/30 rounded-full text-slate-800 transition-colors"
          >
            <Unlock size={18} />
          </button>
        ) : (
          <button className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-700 transition-colors">
            <Moon size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
