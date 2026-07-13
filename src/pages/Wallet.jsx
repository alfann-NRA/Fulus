import { Plus, Rocket, Trophy, Lock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Parse from '../lib/parse';

export default function Wallet({ isProMode }) {
  const [loading, setLoading] = useState(true);
  const [totalAsset, setTotalAsset] = useState(0);
  const [dompet, setDompet] = useState(0);
  const [likuid, setLikuid] = useState(0);
  const [tetap, setTetap] = useState(0);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        if (!isProMode) return; // Only fetch if Pro Mode
        
        const query = new Parse.Query("Asset");
        const results = await query.find();
        
        let sumTotal = 0;
        let sumDompet = 0;
        let sumLikuid = 0;
        let sumTetap = 0;

        results.forEach(asset => {
          const bal = asset.get('balance') || 0;
          const type = asset.get('type') || 'dompet';
          
          sumTotal += bal;
          if (type === 'dompet') sumDompet += bal;
          else if (type === 'likuid') sumLikuid += bal;
          else if (type === 'tetap') sumTetap += bal;
        });

        setTotalAsset(sumTotal);
        setDompet(sumDompet);
        setLikuid(sumLikuid);
        setTetap(sumTetap);
        
      } catch (error) {
        console.error("Error fetching assets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [isProMode]);

  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  return (
    <div className="pb-10 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Aset {!isProMode && <Lock size={20} className="text-slate-400" />}
          </h2>
          <p className="text-slate-500 font-medium">Tingkatkan kekayaanmu.</p>
        </div>
        <button className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-slate-800 shadow-lg shadow-brand/20">
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="bg-slate-850 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-light/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-light/80 text-xs font-bold uppercase tracking-widest mb-2">
            <div className="w-2 h-2 rotate-45 border border-brand-light/80"></div>
            Estimasi Kekayaan
            {loading && isProMode && <Loader2 size={12} className="animate-spin ml-2" />}
          </div>
          
          <h1 className="text-4xl font-black tracking-tight mb-8">
            {isProMode ? formatRupiah(totalAsset) : 'Rp***.***,**'}
          </h1>

          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/5 mb-8">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-slate-900">
              <Rocket size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Total Runway</div>
              <div className="font-bold text-lg leading-none mt-1">
                {isProMode ? '22.7' : '**.*'} <span className="text-sm font-medium text-white/50">Bulan</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-white/50" />
              <div>
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Level Saat Ini</div>
                <div className="font-bold">Aman</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Target Berikutnya</div>
              <div className="font-bold text-brand">{isProMode ? formatRupiah(270000000) : 'Rp***.***.***,**'}</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-white/50 uppercase tracking-wider text-[10px]">Progres ke Level Berikutnya</span>
              <span className="text-brand">44%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full" style={{ width: '44%' }}></div>
            </div>
          </div>

          {/* Cards Sub-Assets */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Dompet & Akun</span>
              </div>
              <div className="font-bold text-sm">{isProMode ? formatRupiah(dompet) : 'Rp***'}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Aset Likuid</span>
              </div>
              <div className="font-bold text-sm">{isProMode ? formatRupiah(likuid) : 'Rp***'}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Aset Tetap</span>
              </div>
              <div className="font-bold text-sm">{isProMode ? formatRupiah(tetap) : 'Rp***'}</div>
            </div>
          </div>

        </div>
      </div>
      
      {!isProMode && (
        <p className="text-center text-slate-400 text-sm mt-6">
          Buka kunci fitur Pro untuk melihat rincian aset.
        </p>
      )}
    </div>
  );
}
