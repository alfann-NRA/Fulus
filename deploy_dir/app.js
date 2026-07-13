import { createClient } from 'https://esm.sh/@insforge/sdk@1.4.0';

const insforgeUrl = 'https://gsr3bfw5.ap-southeast.insforge.app';
const insforgeKey = 'anon_fc4103d5513eec0fbf11f61d65006fd31169d6308eeecefc1ba121504013f2da';
const insforge = createClient({ baseUrl: insforgeUrl, anonKey: insforgeKey });

// Initialize Google Charts
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(() => {
    // Only render chart once data is loaded and charts is ready
    if (transactions.length > 0 || expenses.length > 0) {
        renderChart();
    }
});

// State
let transactions = [];
let expenses = [];
let proofs = [];
let isUnlocked = false;

// Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Format Date
const formatDate = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const isWithinDays = (dateString, days) => {
    const today = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= days;
};

const isWithinDateRange = (dateString, startStr, endStr) => {
    const date = new Date(dateString);
    date.setHours(0,0,0,0);
    
    if (startStr && endStr) {
        const start = new Date(startStr); start.setHours(0,0,0,0);
        const end = new Date(endStr); end.setHours(0,0,0,0);
        return date >= start && date <= end;
    } else if (startStr) {
        const start = new Date(startStr); start.setHours(0,0,0,0);
        return date >= start;
    } else if (endStr) {
        const end = new Date(endStr); end.setHours(0,0,0,0);
        return date <= end;
    }
    return isToday(dateString);
};

window.formatInputRupiah = function(elm) {
    let value = elm.value.replace(/[^0-9]/g, '');
    if (value) {
        elm.value = parseInt(value, 10).toLocaleString('id-ID');
    } else {
        elm.value = '';
    }
};

window.updateTransferAmount = () => {
    const startStr = document.getElementById('tf-start-date').value;
    const endStr = document.getElementById('tf-end-date').value;
    
    let totalOmset = 0;
    let totalBiaya = 0;

    transactions.forEach(t => {
        if (isWithinDateRange(t.date, startStr, endStr)) {
            totalOmset += parseInt(t.sellingPrice);
        }
    });

    expenses.forEach(e => {
        if (isWithinDateRange(e.date, startStr, endStr)) {
            totalBiaya += parseInt(e.amount);
        }
    });

    const transferAmount = totalOmset - totalBiaya;
    document.getElementById('transfer-amount').innerText = formatCurrency(transferAmount);
};

// Fetch data from InsForge
const loadData = async () => {
    document.getElementById('today-omset').innerText = 'Loading...';
    
    const [txRes, expRes, proofRes] = await Promise.all([
        insforge.database.from('transactions').select(),
        insforge.database.from('expenses').select(),
        insforge.database.from('transfer_proofs').select().order('created_at', { ascending: false })
    ]);
    
    if (txRes.error) console.error("Error fetching transactions", txRes.error);
    if (expRes.error) console.error("Error fetching expenses", expRes.error);
    if (proofRes && proofRes.error) console.error("Error fetching proofs", proofRes.error);
    
    if (txRes.data) transactions = txRes.data.map(t => ({...t, sellingPrice: t.selling_price}));
    if (expRes.data) expenses = expRes.data;
    if (proofRes && proofRes.data) proofs = proofRes.data;
    
    updatePublicDashboard();
    if(isUnlocked) updateProtectedDashboard();
    renderProofs();
};

const updatePublicDashboard = () => {
    let todayOmset = 0;
    let todayCount = 0;

    transactions.forEach(t => {
        if (isToday(t.date)) {
            todayOmset += parseInt(t.sellingPrice);
            todayCount++;
        }
    });

    document.getElementById('today-omset').innerText = formatCurrency(todayOmset);
    document.getElementById('today-tx-count').innerText = todayCount;

    const tbody = document.getElementById('public-table-body');
    tbody.innerHTML = '';
    
    let todayRecords = [];
    transactions.forEach(t => { if(isToday(t.date)) todayRecords.push({...t, type: 'omset'}) });
    expenses.forEach(e => { if(isToday(e.date)) todayRecords.push({...e, type: 'expense'}) });
    
    todayRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    todayRecords.forEach(r => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-brand-50/50 transition-colors";
        
        const isExpense = r.type === 'expense';
        const colorClass = isExpense ? 'text-[#e88882]' : 'text-brand-500';
        const sign = isExpense ? '-' : '+';
        const amount = isExpense ? r.amount : r.sellingPrice;
        
        tr.innerHTML = `
            <td class="px-6 py-4 font-semibold">${formatDate(r.date)}</td>
            <td class="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full ${isExpense ? 'bg-rose-500' : 'bg-brand-500'}"></span>
                ${r.name}
            </td>
            <td class="px-6 py-3 text-right font-medium ${colorClass}">${sign}${formatCurrency(amount)}</td>
        `;
        tbody.appendChild(tr);
    });

    if (todayRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-slate-500">Belum ada transaksi hari ini</td></tr>';
    }

    if(google.visualization) {
        setTimeout(() => renderChart(), 50);
    }
    if(window.updateTransferAmount) {
        window.updateTransferAmount();
    }
};

const switchTab = (tab) => {
    const formOmset = document.getElementById('form-omset-container');
    const formExpense = document.getElementById('form-expense-container');
    const tabOmset = document.getElementById('tab-omset');
    const tabExpense = document.getElementById('tab-expense');

    const activeClasses = ['border-brand-400', 'text-brand-600', 'bg-white', 'shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]', 'font-black'];
    const inactiveClasses = ['border-transparent', 'text-slate-400', 'font-bold'];

    if (tab === 'omset') {
        formOmset.classList.remove('hidden');
        formExpense.classList.add('hidden');
        tabOmset.classList.add(...activeClasses);
        tabOmset.classList.remove(...inactiveClasses);
        tabExpense.classList.remove(...activeClasses);
        tabExpense.classList.add(...inactiveClasses);
    } else {
        formExpense.classList.remove('hidden');
        formOmset.classList.add('hidden');
        tabExpense.classList.add(...activeClasses);
        tabExpense.classList.remove(...inactiveClasses);
        tabOmset.classList.remove(...activeClasses);
        tabOmset.classList.add(...inactiveClasses);
    }
};

const showToast = (message, isError = false) => {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    
    // Quick error styling toggle
    const icon = toast.querySelector('svg') || toast.querySelector('i');
    if (icon) {
        if(isError) {
            icon.classList.remove('text-[#6ba88f]', 'text-green-400');
            icon.classList.add('text-rose-500');
        } else {
            icon.classList.remove('text-rose-500', 'text-rose-400');
            icon.classList.add('text-[#6ba88f]');
        }
    }

    toast.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-32', 'opacity-0');
    }, 3000);
};

const submitOmset = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Menyimpan...';

    const name = document.getElementById('omset-name').value;
    const priceStr = document.getElementById('omset-price').value.replace(/\./g, '');
    const price = parseInt(priceStr, 10);
    const dateInput = document.getElementById('omset-date').value;

    const payload = { 
        name: name,
        selling_price: price,
        profit: price
    };

    if (dateInput) {
        payload.date = new Date(dateInput).toISOString();
    }

    // Optimistic UI
    const tempId = 'temp-' + Date.now();
    const tempRecord = {
        ...payload,
        id: tempId,
        date: payload.date || new Date().toISOString(),
        sellingPrice: payload.selling_price
    };
    transactions.unshift(tempRecord);
    e.target.reset();
    document.getElementById('omset-date').focus();
    showToast("Omset berhasil dicatat!");
    updatePublicDashboard();
    if(isUnlocked) updateProtectedDashboard();

    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="plus-circle" class="w-5 h-5"></i> Simpan Omset`;
    lucide.createIcons();

    // Async Insert to DB
    insforge.database.from('transactions').insert([payload]).select().then(({ data, error }) => {
        if (error) {
            console.error(error);
            showToast("Gagal menyimpan ke server!", true);
            transactions = transactions.filter(t => t.id !== tempId);
            updatePublicDashboard();
            if(isUnlocked) updateProtectedDashboard();
        } else {
            const idx = transactions.findIndex(t => t.id === tempId);
            if(idx !== -1) {
                transactions[idx] = {...data[0], sellingPrice: data[0].selling_price};
                updateProtectedDashboard();
            }
        }
    });
};

const submitExpense = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Menyimpan...';

    const name = document.getElementById('expense-name').value;
    const amountStr = document.getElementById('expense-amount').value.replace(/\./g, '');
    const amount = parseInt(amountStr, 10);
    const dateInput = document.getElementById('expense-date').value;

    const payload = { 
        name: name,
        amount: amount
    };

    if (dateInput) {
        payload.date = new Date(dateInput).toISOString();
    }

    // Optimistic UI
    const tempId = 'temp-' + Date.now();
    const tempRecord = {
        ...payload,
        id: tempId,
        date: payload.date || new Date().toISOString()
    };
    expenses.unshift(tempRecord);
    e.target.reset();
    document.getElementById('expense-date').focus();
    showToast("Pengeluaran berhasil dicatat!");
    updatePublicDashboard();
    if(isUnlocked) updateProtectedDashboard();

    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="minus-circle" class="w-5 h-5"></i> Simpan Pengeluaran`;
    lucide.createIcons();

    // Async Insert to DB
    insforge.database.from('expenses').insert([payload]).select().then(({ data, error }) => {
        if (error) {
            console.error(error);
            showToast("Gagal menyimpan ke server!", true);
            expenses = expenses.filter(e => e.id !== tempId);
            updatePublicDashboard();
            if(isUnlocked) updateProtectedDashboard();
        } else {
            const idx = expenses.findIndex(e => e.id === tempId);
            if(idx !== -1) {
                expenses[idx] = data[0];
                updateProtectedDashboard();
            }
        }
    });
};

const openPinModal = () => {
    const modal = document.getElementById('pin-modal');
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-error').classList.add('hidden');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('pin-modal-content').classList.remove('scale-90', 'translate-y-8');
        document.getElementById('pin-input').focus();
    }, 10);
};

const closePinModal = () => {
    const modal = document.getElementById('pin-modal');
    modal.classList.add('opacity-0');
    document.getElementById('pin-modal-content').classList.add('scale-90', 'translate-y-8');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 400);
};

const verifyPin = (e) => {
    e.preventDefault();
    const pin = document.getElementById('pin-input').value;
    
    if (pin === '369369') {
        closePinModal();
        unlockApp();
    } else {
        document.getElementById('pin-error').classList.remove('hidden');
        document.getElementById('pin-input').value = '';
    }
};

const unlockApp = () => {
    isUnlocked = true;
    document.getElementById('view-public').classList.add('hidden');
    document.getElementById('view-public').classList.remove('block');
    document.getElementById('view-protected').classList.remove('hidden');
    document.getElementById('view-protected').classList.add('flex');
    
    document.getElementById('btn-lock').classList.add('hidden');
    document.getElementById('btn-unlock').classList.remove('hidden');
    document.getElementById('btn-unlock').classList.add('flex');
    
    updateProtectedDashboard();
};

const lockApp = () => {
    isUnlocked = false;
    document.getElementById('view-protected').classList.add('hidden');
    document.getElementById('view-protected').classList.remove('flex');
    document.getElementById('view-public').classList.remove('hidden');
    document.getElementById('view-public').classList.add('block');
    
    document.getElementById('btn-unlock').classList.add('hidden');
    document.getElementById('btn-unlock').classList.remove('flex');
    document.getElementById('btn-lock').classList.remove('hidden');
    
    document.getElementById('protected-table-body').innerHTML = '';
};

window.updateProtectedDashboard = () => {
    const startStr = document.getElementById('prot-start-date').value;
    const endStr = document.getElementById('prot-end-date').value;

    let totalLabaKotor = 0;
    let totalPengeluaran = 0;
    let filteredRecords = [];

    transactions.forEach(t => { 
        if(isWithinDateRange(t.date, startStr, endStr)) {
            filteredRecords.push({...t, type: 'omset'});
            totalLabaKotor += t.profit;
        }
    });
    expenses.forEach(e => { 
        if(isWithinDateRange(e.date, startStr, endStr)) {
            filteredRecords.push({...e, type: 'expense'});
            totalPengeluaran += e.amount;
        }
    });
    
    let totalLabaBersih = (totalLabaKotor - totalPengeluaran) * 0.2;

    document.getElementById('prot-laba-kotor').innerText = formatCurrency(totalLabaKotor);
    document.getElementById('prot-pengeluaran').innerText = formatCurrency(totalPengeluaran);
    document.getElementById('prot-laba-bersih').innerText = formatCurrency(totalLabaBersih);

    const tbody = document.getElementById('protected-table-body');
    tbody.innerHTML = '';
    
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredRecords.forEach(r => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-brand-50/50 transition-colors";
        
        const isExpense = r.type === 'expense';
        
        if (isExpense) {
            tr.innerHTML = `
                <td class="px-6 py-4"><span class="px-2 py-1 bg-[#ffb7b2]/30 text-[#e88882] rounded-lg text-xs font-black tracking-wide border border-[#ffb7b2]/50">BIAYA</span></td>
                <td class="px-6 py-4 font-semibold">${formatDate(r.date)}</td>
                <td class="px-6 py-4 font-bold text-slate-700">${r.name}</td>
                <td class="px-6 py-4 text-right text-slate-300">-</td>
                <td class="px-6 py-4 text-right text-[#e88882] font-bold">${formatCurrency(r.amount)}</td>
                <td class="px-6 py-4 text-right text-[#e88882] font-black">-${formatCurrency(r.amount)}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="deleteRecord('${r.id}', 'expense')" class="text-slate-300 hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-rose-50" title="Hapus">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
        } else {
            tr.innerHTML = `
                <td class="px-6 py-4"><span class="px-2 py-1 bg-brand-100 text-brand-600 rounded-lg text-xs font-black tracking-wide border border-brand-200">OMSET</span></td>
                <td class="px-6 py-4 font-semibold">${formatDate(r.date)}</td>
                <td class="px-6 py-4 font-bold text-slate-700">${r.name}</td>
                <td class="px-6 py-4 text-right font-bold text-slate-600">${formatCurrency(r.sellingPrice)}</td>
                <td class="px-6 py-4 text-right text-slate-300">-</td>
                <td class="px-6 py-4 text-right text-brand-500 font-black">+${formatCurrency(r.profit)}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="deleteRecord('${r.id}', 'omset')" class="text-slate-300 hover:text-rose-400 transition-colors p-2 rounded-xl hover:bg-rose-50" title="Hapus">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
        }
        tbody.appendChild(tr);
    });

    if (filteredRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-slate-500">Belum ada riwayat data</td></tr>';
    }
    
    lucide.createIcons();
};

window.renderChart = function() {
    if (!google.visualization) return;

    const filter = document.getElementById('chart-filter').value;
    const days = filter === 'week' ? 7 : 30;

    let dailyData = {};
    for(let i=days-1; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        dailyData[dateStr] = 0;
    }

    transactions.forEach(t => {
        if (isWithinDays(t.date, days)) {
            const dateStr = new Date(t.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
            if (dailyData[dateStr] !== undefined) {
                dailyData[dateStr] += parseInt(t.sellingPrice);
            }
        }
    });

    let chartData = [['Tanggal', 'Total Omset']];
    let hasData = false;
    for (const [date, amount] of Object.entries(dailyData)) {
        chartData.push([date, amount]);
        if(amount > 0) hasData = true;
    }

    if (!hasData) {
        document.getElementById('piechart_3d').innerHTML = '<p class="text-slate-400 text-sm italic flex h-full items-center justify-center">Belum ada data transaksi di periode ini</p>';
        return;
    }

    const data = google.visualization.arrayToDataTable(chartData);
    const isDarkMode = document.documentElement.classList.contains('dark');
    const options = {
        is3D: true,
        backgroundColor: 'transparent',
        legend: { textStyle: { color: '#64748b', fontName: 'Outfit', bold: true }, position: 'right' },
        chartArea: { width: '90%', height: '90%' },
        colors: ['#c084fc', '#ffb7b2', '#b5ead7', '#ffdac1', '#e2f0cb', '#d8b4fe']
    };

    const chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart.draw(data, options);
}

window.deleteRecord = async (id, type) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    const table = type === 'omset' ? 'transactions' : 'expenses';
    
    const { error } = await insforge.database
        .from(table)
        .delete()
        .eq('id', id);

    if (error) {
        showToast("Gagal menghapus data!", true);
        console.error(error);
    } else {
        if (type === 'omset') {
            transactions = transactions.filter(t => String(t.id) !== String(id));
        } else {
            expenses = expenses.filter(e => String(e.id) !== String(id));
        }
        showToast("Data berhasil dihapus!");
        updatePublicDashboard();
        updateProtectedDashboard();
    }
};

window.uploadProof = async (input) => {
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const btn = document.getElementById('btn-upload-proof');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Mengunggah...`;
    btn.disabled = true;
    lucide.createIcons();

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await insforge.storage.from('proofs').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = insforge.storage.from('proofs').getPublicUrl(filePath);
        
        const startStr = document.getElementById('tf-start-date').value;
        const endStr = document.getElementById('tf-end-date').value;
        
        let totalOmset = 0;
        let totalBiaya = 0;
        transactions.forEach(t => {
            if (isWithinDateRange(t.date, startStr, endStr)) totalOmset += parseInt(t.sellingPrice);
        });
        expenses.forEach(e => {
            if (isWithinDateRange(e.date, startStr, endStr)) totalBiaya += parseInt(e.amount);
        });
        const transferAmount = totalOmset - totalBiaya;

        const payload = {
            start_date: startStr ? new Date(startStr).toISOString() : new Date().toISOString(),
            end_date: endStr ? new Date(endStr).toISOString() : new Date().toISOString(),
            amount: transferAmount,
            photo_url: urlData.publicUrl
        };

        const { data: proofData, error: dbError } = await insforge.database.from('transfer_proofs').insert([payload]).select();
        if (dbError) throw dbError;

        if (proofData) {
            proofs.unshift(proofData[0]);
            renderProofs();
        }

        showToast("Bukti transfer berhasil diunggah!");
    } catch (error) {
        console.error("Upload error:", error);
        showToast("Gagal mengunggah bukti transfer", true);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        input.value = '';
        lucide.createIcons();
    }
};

const renderProofs = () => {
    const gallery = document.getElementById('proofs-gallery');
    if (!gallery) return;
    
    gallery.innerHTML = '';
    
    if (proofs.length === 0) {
        gallery.innerHTML = '<div class="col-span-full text-center text-slate-400 py-8 text-sm font-semibold">Belum ada bukti transfer</div>';
        return;
    }

    proofs.forEach(p => {
        const div = document.createElement('div');
        div.className = "relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 card-3d aspect-square";
        
        div.innerHTML = `
            <img src="${p.photo_url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p class="text-white text-[10px] font-bold opacity-80">${formatDate(p.start_date)} - ${formatDate(p.end_date)}</p>
                <p class="text-[#ffdac1] text-sm font-black">${formatCurrency(p.amount)}</p>
                <a href="${p.photo_url}" target="_blank" class="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors">
                    <i data-lucide="maximize-2" class="w-3 h-3"></i>
                </a>
            </div>
        `;
        gallery.appendChild(div);
    });
    
    lucide.createIcons();
};

// Expose handlers to window because this is an ES Module
window.switchTab = switchTab;
window.submitOmset = submitOmset;
window.submitExpense = submitExpense;
window.deleteRecord = deleteRecord;
window.openPinModal = openPinModal;
window.closePinModal = closePinModal;
window.verifyPin = verifyPin;
window.unlockApp = unlockApp;
window.lockApp = lockApp;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize date inputs to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('prot-start-date').value = today;
    document.getElementById('prot-end-date').value = today;
    document.getElementById('tf-start-date').value = today;
    document.getElementById('tf-end-date').value = today;

    // Hide Splash Screen after 2.5s
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.remove();
            }, 1000);
        }, 2500);
    }

    const savedPin = localStorage.getItem('tehnang_pin');
    loadData();
});

window.addEventListener('resize', () => {
    if (google.visualization) window.renderChart();
});
