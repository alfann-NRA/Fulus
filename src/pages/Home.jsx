import { ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import Parse from '../lib/parse';

export default function Home({ isProMode }) {
  const [loading, setLoading] = useState(true);
  const [monthlyTx, setMonthlyTx] = useState({});
  const [totalBudgetPct, setTotalBudgetPct] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const txQuery = new Parse.Query("Transaction");
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        txQuery.greaterThanOrEqualTo("createdAt", startOfMonth);
        const txResults = await txQuery.find();

        let txByDate = {};
        
        txResults.forEach(tx => {
          const dateStr = tx.createdAt.getDate();
          const amt = tx.get("amount") || 0;
          txByDate[dateStr] = (txByDate[dateStr] || 0) + amt;
        });

        setMonthlyTx(txByDate);

        // Fetch Budget for simple calculation
        const budgetQuery = new Parse.Query("Budget");
        const budgetResults = await budgetQuery.find();
        let totalMax = 0;
        budgetResults.forEach(b => {
          totalMax += (b.get("maxLimit") || 0);
        });
        
        if (totalMax === 0) totalMax = 4735000; // Mock if empty

        let totalSpent = 0;
        Object.values(txByDate).forEach(amt => totalSpent += amt);
        
        setTotalBudgetPct(Math.min(Math.round((totalSpent / totalMax) * 100), 100));

      } catch (error) {
        console.error("Gagal load data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatK = (val) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'JT';
    if (val >= 1000) return Math.round(val / 1000) + 'RB';
    return val;
  };

  const renderCalendar = () => {
    const days = ['SN', 'SL', 'RB', 'KM', 'JM', 'SB', 'MG'];
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dates = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const today = now.getDate();
    
    // Simplification for start day layout (mocked to start on Wednesday for July 2026 as per original design)
    const emptyStartDays = 2; 

    return (
      <div className="glass-card rounded-[2rem] p-6 mt-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-between">
          Aktivitas Bulan Ini
          {loading && <Loader2 size={16} className="animate-spin text-brand" />}
        </h3>
        
        <p className="text-sm font-bold text-gradient mb-4 uppercase tracking-wider">
          {now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
        </p>
        
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-xs font-semibold">
          {days.map(d => (
            <div key={d} className="text-slate-400">{d}</div>
          ))}
          
          {Array.from({ length: emptyStartDays }).map((_, i) => <div key={`e-${i}`}></div>)}
          
          {dates.map(date => {
            const hasTx = monthlyTx[date];
            const amount = hasTx ? `-${formatK(hasTx)}` : null;
            const isToday = date === today;
            
            const bgClass = hasTx ? (date === 1 ? "bg-brand/20" : "bg-brand/10") : "bg-slate-50";
            const amountColor = "text-pink-500";
            
            return (
              <div 
                key={date} 
                className={clsx(
                  "h-14 rounded-xl flex flex-col items-center justify-start py-1 relative transition-transform hover:scale-110",
                  bgClass,
                  isToday && "border-2 border-brand shadow-md shadow-brand/20 bg-white"
                )}
              >
                <span className={clsx("text-slate-700", isToday && "font-black text-brand")}>{date}</span>
                {amount && <span className={clsx("text-[9px] font-bold mt-auto leading-none", amountColor)}>{amount}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-10 animate-fade-in">
      <div className="glass-card rounded-[2rem] p-6 flex gap-4 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl"></div>
        <div className="w-16 h-16 rounded-full border-[6px] border-slate-100/50 flex items-center justify-center relative shadow-inner bg-white/50">
          <svg className="absolute inset-0 w-full h-full drop-shadow-md" viewBox="0 0 36 36">
            <path
              className="text-slate-200"
              strokeDasharray="100, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
            <path
              className="text-brand transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              strokeDasharray={`${totalBudgetPct}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="currentColor" strokeWidth="3"
            />
          </svg>
          <div className="text-center">
            <div className="text-[10px] font-bold text-slate-400 leading-none">HARI</div>
            <div className="text-lg font-black text-slate-800 leading-none mt-1">{new Date().getDate()}</div>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Progres Pengeluaran</h2>
          <p className="text-sm text-slate-500 font-semibold mt-1">Hari {new Date().getDate()} dari {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}</p>
        </div>
      </div>

      {renderCalendar()}
      
      {!isProMode && (
        <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-[2rem] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand/30 rounded-full blur-3xl group-hover:bg-brand/50 transition-all duration-500"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl group-hover:bg-brand-accent/40 transition-all duration-500"></div>
          <h3 className="text-lg font-black tracking-wide relative z-10">Buka Fitur Pro</h3>
          <p className="text-sm text-slate-300 mt-2 relative z-10 font-medium">Dapatkan akses ke kalender tak terbatas, scan AI, dan rincian aset.</p>
        </div>
      )}
    </div>
  );
}
