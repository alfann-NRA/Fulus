import { Camera, Image, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Parse from '../lib/parse';

export default function Scan({ isProMode }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = () => {
    if (!isProMode) return;
    setScanning(true);
    // Mocking AI Extraction
    setTimeout(() => {
      setScanning(false);
      setResult({
        merchant: 'STARBUCKS',
        date: '09 JUL 2026',
        total: 'Rp 65.000',
        category: 'Keinginan'
      });
    }, 2500);
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      setScanning(true);
      const Transaction = Parse.Object.extend("Transaction");
      const transaction = new Transaction();
      
      transaction.set("merchant", result.merchant);
      transaction.set("amount", 65000); // from parsed Rp 65.000
      transaction.set("category", result.category);
      transaction.set("type", "expense");
      
      await transaction.save();
      
      alert("Transaksi berhasil disimpan ke database!");
      setResult(null);
    } catch (error) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="pb-10 fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Scan Struk</h2>
        <div className="bg-orange-50 text-orange-500 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm border border-orange-100">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          248 Koin
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        
        {/* Dashed Border Area */}
        <div className="absolute inset-4 border-2 border-dashed border-slate-200 rounded-[2rem] pointer-events-none"></div>

        {!isProMode ? (
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
              <Camera size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Fitur Pro Terkunci</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-[200px] text-sm">
              Buka kunci fitur Pro untuk scan struk dan ekstraksi otomatis dengan AI.
            </p>
          </div>
        ) : scanning ? (
          <div className="relative z-10 flex flex-col items-center">
            <Loader2 size={48} className="text-brand animate-spin mb-6" />
            <p className="text-lg font-bold text-slate-700">AI sedang membaca struk...</p>
          </div>
        ) : result ? (
          <div className="relative z-10 flex flex-col items-center w-full px-4">
            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center text-brand-dark mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ekstraksi Berhasil</h3>
            
            <div className="bg-slate-50 w-full rounded-2xl p-4 text-left space-y-3 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-400">Merchant</label>
                <div className="font-semibold text-slate-700">{result.merchant}</div>
              </div>
              <div className="flex justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-400">Tanggal</label>
                  <div className="font-semibold text-slate-700">{result.date}</div>
                </div>
                <div className="text-right">
                  <label className="text-xs font-bold text-slate-400">Total</label>
                  <div className="font-bold text-brand-dark text-lg">{result.total}</div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="bg-slate-800 text-white w-full py-4 rounded-2xl font-bold text-lg hover:bg-slate-700 transition-colors shadow-lg">
              Simpan Transaksi
            </button>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 mb-6 shadow-inner">
              <Camera size={36} />
            </div>
            <p className="text-slate-500 font-medium mb-8 max-w-[200px] text-sm">
              Foto struk untuk otomatis buat transaksi dengan AI.
            </p>
            
            <div className="flex gap-4 w-full px-2">
              <button 
                onClick={handleScan}
                className="flex-1 bg-brand text-slate-800 py-4 rounded-2xl font-bold hover:brightness-105 transition-all shadow-lg shadow-brand/30"
              >
                Ambil Foto
              </button>
              <button 
                onClick={handleScan}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
              >
                Unggah Gambar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
