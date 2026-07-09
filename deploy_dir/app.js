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

// Fetch data from InsForge
const loadData = async () => {
    document.getElementById('today-omset').innerText = 'Loading...';
    
    const [txRes, expRes] = await Promise.all([
        insforge.database.from('transactions').select(),
        insforge.database.from('expenses').select()
    ]);
    
    if (txRes.error) console.error("Error fetching transactions", txRes.error);
    if (expRes.error) console.error("Error fetching expenses", expRes.error);
    
    if (txRes.data) transactions = txRes.data.map(t => ({...t, sellingPrice: t.selling_price}));
    if (expRes.data) expenses = expRes.data;
    
    updatePublicDashboard();
    if(isUnlocked) updateProtectedDashboard();
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
        tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
        
        const isExpense = r.type === 'expense';
        const colorClass = isExpense ? 'text-rose-500' : 'text-brand-500';
        const sign = isExpense ? '-' : '+';
        const amount = isExpense ? r.amount : r.sellingPrice;
        
        tr.innerHTML = `
            <td class="px-6 py-3">${formatDate(r.date)}</td>
            <td class="px-6 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
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

    if(google.visualization) renderChart();
};

const switchTab = (tab) => {
    const formOmset = document.getElementById('form-omset-container');
    const formExpense = document.getElementById('form-expense-container');
    const tabOmset = document.getElementById('tab-omset');
    const tabExpense = document.getElementById('tab-expense');

    if (tab === 'omset') {
        formOmset.classList.remove('hidden');
        formExpense.classList.add('hidden');
        tabOmset.classList.add('border-brand-500', 'text-brand-600', 'dark:text-brand-500', 'bg-brand-50/50', 'dark:bg-brand-900/20');
        tabOmset.classList.remove('border-transparent', 'text-slate-500');
        tabExpense.classList.remove('border-brand-500', 'text-brand-600', 'dark:text-brand-500', 'bg-brand-50/50', 'dark:bg-brand-900/20');
        tabExpense.classList.add('border-transparent', 'text-slate-500');
    } else {
        formExpense.classList.remove('hidden');
        formOmset.classList.add('hidden');
        tabExpense.classList.add('border-brand-500', 'text-brand-600', 'dark:text-brand-500', 'bg-brand-50/50', 'dark:bg-brand-900/20');
        tabExpense.classList.remove('border-transparent', 'text-slate-500');
        tabOmset.classList.remove('border-brand-500', 'text-brand-600', 'dark:text-brand-500', 'bg-brand-50/50', 'dark:bg-brand-900/20');
        tabOmset.classList.add('border-transparent', 'text-slate-500');
    }
};

const showToast = (message, isError = false) => {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    
    // Quick error styling toggle
    if(isError) {
        toast.querySelector('i').classList.replace('text-green-400', 'text-rose-400');
    } else {
        toast.querySelector('i').classList.replace('text-rose-400', 'text-green-400');
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
};

const submitOmset = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Menyimpan...';

    const name = document.getElementById('omset-name').value;
    const price = document.getElementById('omset-price').value;

    const { data, error } = await insforge.database
        .from('transactions')
        .insert([{ 
            name: name,
            selling_price: parseInt(price),
            profit: parseInt(price)
        }])
        .select();

    if (error) {
        showToast("Gagal menyimpan omset!", true);
        console.error(error);
    } else {
        const newRecord = data[0];
        transactions.push({...newRecord, sellingPrice: newRecord.selling_price});
        e.target.reset();
        showToast("Omset berhasil dicatat!");
        updatePublicDashboard();
        if(isUnlocked) updateProtectedDashboard();
    }
    
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="plus-circle" class="w-4 h-4"></i> Simpan Omset`;
    lucide.createIcons();
};

const submitExpense = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Menyimpan...';

    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;

    const { data, error } = await insforge.database
        .from('expenses')
        .insert([{ 
            name: name,
            amount: parseInt(amount)
        }])
        .select();

    if (error) {
        showToast("Gagal menyimpan pengeluaran!", true);
        console.error(error);
    } else {
        expenses.push(data[0]);
        e.target.reset();
        showToast("Pengeluaran berhasil dicatat!");
        updatePublicDashboard();
        if(isUnlocked) updateProtectedDashboard();
    }
    
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="minus-circle" class="w-4 h-4"></i> Simpan Pengeluaran`;
    lucide.createIcons();
};

const openPinModal = () => {
    const modal = document.getElementById('pin-modal');
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-error').classList.add('hidden');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('pin-modal-content').classList.remove('scale-95');
        document.getElementById('pin-input').focus();
    }, 10);
};

const closePinModal = () => {
    const modal = document.getElementById('pin-modal');
    modal.classList.add('opacity-0');
    document.getElementById('pin-modal-content').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
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

const updateProtectedDashboard = () => {
    let todayLabaKotor = 0;
    let todayPengeluaran = 0;

    let allRecords = [];
    transactions.forEach(t => { 
        allRecords.push({...t, type: 'omset'});
        if(isToday(t.date)) todayLabaKotor += t.profit;
    });
    expenses.forEach(e => { 
        allRecords.push({...e, type: 'expense'});
        if(isToday(e.date)) todayPengeluaran += e.amount;
    });
    
    let todayLabaBersih = todayLabaKotor - todayPengeluaran;

    document.getElementById('prot-laba-kotor').innerText = formatCurrency(todayLabaKotor);
    document.getElementById('prot-pengeluaran').innerText = formatCurrency(todayPengeluaran);
    document.getElementById('prot-laba-bersih').innerText = formatCurrency(todayLabaBersih);

    const tbody = document.getElementById('protected-table-body');
    tbody.innerHTML = '';
    
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    allRecords.forEach(r => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
        
        const isExpense = r.type === 'expense';
        
        if (isExpense) {
            tr.innerHTML = `
                <td class="px-6 py-4"><span class="px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded text-xs font-bold">BIAYA</span></td>
                <td class="px-6 py-4">${formatDate(r.date)}</td>
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">${r.name}</td>
                <td class="px-6 py-4 text-right text-slate-400">-</td>
                <td class="px-6 py-4 text-right text-rose-500 font-medium">${formatCurrency(r.amount)}</td>
                <td class="px-6 py-4 text-right text-rose-500 font-bold">-${formatCurrency(r.amount)}</td>
            `;
        } else {
            tr.innerHTML = `
                <td class="px-6 py-4"><span class="px-2 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded text-xs font-bold">OMSET</span></td>
                <td class="px-6 py-4">${formatDate(r.date)}</td>
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">${r.name}</td>
                <td class="px-6 py-4 text-right font-medium">${formatCurrency(r.sellingPrice)}</td>
                <td class="px-6 py-4 text-right text-slate-400">-</td>
                <td class="px-6 py-4 text-right text-brand-500 font-bold">+${formatCurrency(r.profit)}</td>
            `;
        }
        tbody.appendChild(tr);
    });

    if (allRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-slate-500">Belum ada riwayat data</td></tr>';
    }
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
        legend: { textStyle: { color: isDarkMode ? '#cbd5e1' : '#475569' }, position: 'right' },
        chartArea: { width: '90%', height: '90%' },
        colors: ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1']
    };

    const chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart.draw(data, options);
}

// Expose handlers to window because this is an ES Module
window.switchTab = switchTab;
window.submitOmset = submitOmset;
window.submitExpense = submitExpense;
window.openPinModal = openPinModal;
window.closePinModal = closePinModal;
window.verifyPin = verifyPin;
window.unlockApp = unlockApp;
window.lockApp = lockApp;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

window.addEventListener('resize', () => {
    if (google.visualization) window.renderChart();
});
