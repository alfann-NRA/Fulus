import { Search, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Parse from '../lib/parse';
export default function Transactions({ isProMode }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const query = new Parse.Query("Transaction");
        query.descending("createdAt");
        if (!isProMode) {
          query.limit(2); // Batasi demo
        }
        
        const results = await query.find();
        
        // Format hasil fetch menjadi struktur UI
        const formatted = results.map(tx => ({
          id: tx.id,
          name: tx.get('merchant'),
          category: tx.get('category') || 'Lainnya',
          amount: `- Rp${tx.get('amount').toLocaleString('id-ID')}`,
          icon: '💸',
          bg: 'bg-pink-100',
          date: tx.createdAt
        }));

        // Mengelompokkan berdasarkan tanggal (sederhana)
        const grouped = [
          {
            id: 'fetched_group',
            dateLabel: 'Histori Database',
            dateTotal: '',
            items: formatted
          }
        ];
        
        setTransactions(formatted.length > 0 ? grouped : []);
      } catch (error) {
        console.error("Gagal mengambil data dari Back4App", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isProMode]);

  const displayTx = transactions;

  return (
    <div className="pb-20 fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2 mb-1">
          Transaksi {!isProMode && <Lock size={20} className="text-slate-400" />}
        </h2>
        <p className="text-slate-500 font-medium">Uangmu lari ke mana aja?</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari catatan..."
          className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 font-medium text-slate-700 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all shadow-soft"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
        <button className="flex items-center gap-2 whitespace-nowrap bg-white border border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
          Semua Waktu <ChevronDown size={16} />
        </button>
        <button className="flex items-center gap-2 whitespace-nowrap bg-white border border-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
          Semua Dompet <ChevronDown size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="animate-spin text-brand mb-2" size={32} />
          <p className="text-slate-500 font-semibold text-sm">Mengambil data...</p>
        </div>
      ) : displayTx.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-semibold">
          Belum ada transaksi di database.
        </div>
      ) : (
        <div className="space-y-6">
          {displayTx.map((group) => (
          <div key={group.id}>
            <div className="flex justify-between items-center mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>{group.dateLabel}</span>
              <span>{group.dateTotal}</span>
            </div>
            <div className="space-y-3">
              {group.items.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-soft border border-slate-100/50">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                      {item.category}
                    </span>
                  </div>
                  <div className="font-black text-slate-800 text-sm">
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
          ))}
        </div>
      )}

      {!isProMode && !loading && (
        <div className="mt-6 bg-slate-50 border-2 border-dashed border-slate-200 text-center p-6 rounded-3xl">
          <Lock className="mx-auto text-slate-400 mb-2" size={24} />
          <h4 className="font-bold text-slate-700">Terbatas (Mode Demo)</h4>
          <p className="text-sm text-slate-500 mt-1">Hanya menampilkan 2 hari terakhir. Buka Pro untuk histori tanpa batas.</p>
        </div>
      )}
    </div>
  );
}
