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
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-3xl font-medium text-[var(--color-m3-sys-light-on-surface)] tracking-tight flex items-center gap-2">
            Akun {!isProMode && <Lock size={20} className="text-[var(--color-m3-sys-light-on-surface-variant)]" />}
          </h2>
        </div>
        <button className="w-12 h-12 bg-[var(--color-m3-sys-light-secondary-container)] rounded-full flex items-center justify-center text-[var(--color-m3-sys-light-on-secondary-container)] hover:bg-[var(--color-m3-sys-light-primary-container)] transition-colors">
          <Plus size={24} strokeWidth={2} />
        </button>
      </div>

      <div className="bg-[var(--color-m3-sys-light-surface)] rounded-[2rem] p-6 text-[var(--color-m3-sys-light-on-surface)] shadow-md mb-6 animate-slide-up border border-[var(--color-m3-sys-light-surface-container-high)]">
        <div className="flex items-center gap-2 text-[var(--color-m3-sys-light-primary)] text-sm font-semibold uppercase tracking-widest mb-4">
          <div className="w-2 h-2 rounded-full bg-[var(--color-m3-sys-light-primary)]"></div>
          Semua Akun & Dompet
          {loading && isProMode && <Loader2 size={14} className="animate-spin ml-2" />}
        </div>
        
        <h1 className="text-4xl font-black tracking-tight mb-2">
          {isProMode ? formatRupiah(totalAsset) : 'Rp***.***,**'}
        </h1>
        <p className="text-[var(--color-m3-sys-light-on-surface-variant)] text-sm mb-6">Total Nilai Bersih</p>
        
        <div className="inline-flex items-center gap-3 bg-[var(--color-m3-sys-light-primary-container)] rounded-2xl p-4 w-full mb-6">
          <div className="w-12 h-12 bg-[var(--color-m3-sys-light-primary)] rounded-full flex items-center justify-center text-[var(--color-m3-sys-light-on-primary)] shadow-sm">
            <Rocket size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--color-m3-sys-light-on-primary-container)] opacity-80 uppercase tracking-wider">Total Runway</div>
            <div className="font-bold text-xl leading-none mt-1 text-[var(--color-m3-sys-light-on-primary-container)]">
              {isProMode ? '22.7' : '**.*'} <span className="text-sm font-medium">Bulan</span>
            </div>
          </div>
        </div>

          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[var(--color-m3-sys-light-primary)]" />
              <div>
                <div className="text-[10px] font-bold text-[var(--color-m3-sys-light-on-surface-variant)] uppercase tracking-wider">Level Saat Ini</div>
                <div className="font-bold">Aman</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-[var(--color-m3-sys-light-on-surface-variant)] uppercase tracking-wider">Target Berikutnya</div>
              <div className="font-bold text-[var(--color-m3-sys-light-primary)]">{isProMode ? formatRupiah(270000000) : 'Rp***.***.***,**'}</div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-[var(--color-m3-sys-light-on-surface-variant)] uppercase tracking-wider text-[10px]">Progres Target</span>
              <span className="text-[var(--color-m3-sys-light-primary)]">44%</span>
            </div>
            <div className="h-2 bg-[var(--color-m3-sys-light-surface-container-high)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-m3-sys-light-primary)] rounded-full" style={{ width: '44%' }}></div>
            </div>
          </div>
      </div>

      <h3 className="text-lg font-bold text-[var(--color-m3-sys-light-on-surface)] px-2 mb-3">Akun & Dompet Anda</h3>
      <div className="space-y-3">
        <div className="bg-[var(--color-m3-sys-light-surface)] rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-[var(--color-m3-sys-light-surface-container-high)]">
          <div className="w-12 h-12 bg-[var(--color-m3-sys-light-secondary-container)] rounded-full flex items-center justify-center text-[var(--color-m3-sys-light-on-secondary-container)]">
            <span className="font-black text-xl">D</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[var(--color-m3-sys-light-on-surface)]">Dompet Utama</h4>
            <p className="text-xs text-[var(--color-m3-sys-light-on-surface-variant)]">Aset Likuid</p>
          </div>
          <div className="font-bold text-[var(--color-m3-sys-light-on-surface)]">{isProMode ? formatRupiah(dompet) : 'Rp***'}</div>
        </div>

        <div className="bg-[var(--color-m3-sys-light-surface)] rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-[var(--color-m3-sys-light-surface-container-high)]">
          <div className="w-12 h-12 bg-[#D3E3FD] rounded-full flex items-center justify-center text-[#041E49]">
            <span className="font-black text-xl">B</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[var(--color-m3-sys-light-on-surface)]">Rekening Bank</h4>
            <p className="text-xs text-[var(--color-m3-sys-light-on-surface-variant)]">Aset Likuid</p>
          </div>
          <div className="font-bold text-[var(--color-m3-sys-light-on-surface)]">{isProMode ? formatRupiah(likuid) : 'Rp***'}</div>
        </div>

        <div className="bg-[var(--color-m3-sys-light-surface)] rounded-3xl p-4 flex items-center gap-4 shadow-sm border border-[var(--color-m3-sys-light-surface-container-high)]">
          <div className="w-12 h-12 bg-[#F6D0FB] rounded-full flex items-center justify-center text-[#3D004B]">
            <span className="font-black text-xl">A</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[var(--color-m3-sys-light-on-surface)]">Aset Tetap & Properti</h4>
            <p className="text-xs text-[var(--color-m3-sys-light-on-surface-variant)]">Investasi Jangka Panjang</p>
          </div>
          <div className="font-bold text-[var(--color-m3-sys-light-on-surface)]">{isProMode ? formatRupiah(tetap) : 'Rp***'}</div>
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
