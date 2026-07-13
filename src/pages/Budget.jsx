import { Settings2, HelpCircle, MoreVertical, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Parse from '../lib/parse';

export default function Budget({ isProMode }) {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalLimit, setTotalLimit] = useState(0);

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        // Fetch budget limits
        const budgetQuery = new Parse.Query("Budget");
        const budgetResults = await budgetQuery.find();
        
        let limits = {};
        let icons = {};
        let totalMax = 0;
        
        budgetResults.forEach(b => {
          const cat = b.get("category");
          limits[cat] = b.get("maxLimit") || 0;
          icons[cat] = b.get("icon") || '💰';
          totalMax += limits[cat];
        });

        // Default if DB is empty
        if (Object.keys(limits).length === 0) {
          limits = { 'Bahan Makanan': 1800000, 'Uang Sewa': 2200000, 'Listrik': 305000, 'Air': 30000, 'Wifi & Kuota': 400000 };
          icons = { 'Bahan Makanan': '🥕', 'Uang Sewa': '🏠', 'Listrik': '⚡', 'Air': '💧', 'Wifi & Kuota': '🌐' };
          totalMax = 4735000;
        }

        // Fetch transactions for this month
        const txQuery = new Parse.Query("Transaction");
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        
        txQuery.greaterThanOrEqualTo("createdAt", startOfMonth);
        const txResults = await txQuery.find();

        let spent = {};
        let sumSpent = 0;

        txResults.forEach(tx => {
          const cat = tx.get("category");
          const amt = tx.get("amount") || 0;
          if (cat) {
            spent[cat] = (spent[cat] || 0) + amt;
            sumSpent += amt;
          }
        });

        // Map to array
        const finalBudgets = Object.keys(limits).map(cat => {
          const current = spent[cat] || 0;
          const max = limits[cat];
          const pct = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;
          return {
            name: cat,
            icon: icons[cat] || '💰',
            current,
            max,
            pct
          };
        });

        setTotalLimit(totalMax);
        setTotalSpent(sumSpent);
        setBudgets(finalBudgets);

      } catch (error) {
        console.error("Gagal mengambil data budget", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgets();
  }, []);

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  // Demo mode limits visible budgets
  const displayBudgets = isProMode ? budgets : budgets.slice(0, 3);
  const progressPct = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;

  return (
    <div className="pb-20 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
          <h2 className="text-sm font-black text-slate-800 tracking-widest uppercase">
            Kebutuhan {loading && <Loader2 size={12} className="inline animate-spin text-slate-400" />}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600">
            <Settings2 size={14} /> Ubah
          </button>
          <button className="text-slate-400">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-3 bg-white shadow-inner rounded-full mb-3 overflow-hidden border border-slate-100">
          <div className="h-full bg-gradient-to-r from-brand to-brand-accent rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: `${progressPct}%` }}>
            <div className="absolute inset-0 bg-white/20 blur-sm w-1/2 -skew-x-12 animate-pulse-glow"></div>
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Terpakai: {formatRupiah(totalSpent)}</span>
          <span>Batas: {formatRupiah(totalLimit)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {displayBudgets.map((b, i) => (
          <div key={i} className="glass-card rounded-[2rem] p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 group">
            <div className="text-3xl bg-white shadow-sm p-3 rounded-2xl group-hover:scale-110 transition-transform">{b.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <h4 className="font-bold text-slate-700 text-sm">{b.name}</h4>
                <div className="font-black text-slate-800">{formatRupiah(b.current)}</div>
              </div>
              <div className="h-2 bg-slate-100 shadow-inner rounded-full mb-1.5 overflow-hidden">
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-1000",
                    b.pct >= 90 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-gradient-to-r from-brand-light to-brand shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  )} 
                  style={{ width: `${b.pct}%` }}
                ></div>
              </div>
              <div className="text-right text-[10px] font-bold text-slate-400">
                dari {formatRupiah(b.max)}
              </div>
            </div>
            <button className="text-slate-300 hover:text-slate-500">
              <MoreVertical size={20} />
            </button>
          </div>
        ))}
      </div>
      
      {!isProMode && (
        <div className="mt-6 text-center text-xs font-semibold text-slate-400">
          Beberapa kategori budget disembunyikan dalam mode Demo.
        </div>
      )}
    </div>
  );
}
