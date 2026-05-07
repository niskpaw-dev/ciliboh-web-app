// =====================================================
// UI RENDERING
// =====================================================

function switchView(v) {
    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-' + v).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + v).classList.add('active');
    document.getElementById('current-view-title').innerText = v.toUpperCase();
}

function getStatusClass(st) {
    const s = String(st || '').toLowerCase();
    if (s === 'pending') return 'st-pending';
    if (s === 'delivery') return 'st-delivery';
    if (s === 'completed') return 'st-completed';
    return 'st-processing';
}

function getPaymentClass(payStatus) {
    if (payStatus === 'Paid') return 'pay-paid';
    if (payStatus === 'Partial') return 'pay-partial';
    return 'pay-unpaid';
}

function getPaymentDot(payStatus) {
    if (payStatus === 'Paid') return 'bg-green-500';
    if (payStatus === 'Partial') return 'bg-orange-500';
    return 'bg-red-500';
}

/**
 * Parse number defensively - return 0 jika NaN/null/undefined
 */
function safeNum(val) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
}

/**
 * Escape HTML untuk elak XSS dari customer/product names
 */
function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderUI() {
    if (!window.db) return;

    const validOrders = (window.db.orders || []).filter(o => o && o[0]);

    // ---------- STATS (Dashboard) ----------
    // Backend dah kira stats.totalSales, stats.netProfit
    // Frontend juga kira live sebagai backup/sanity check
    const stats = window.db.stats || {};
    const liveSales = validOrders.reduce((sum, o) => sum + safeNum(o[6]), 0);

    const totalSales = safeNum(stats.totalSales) || liveSales;
    const netProfit = (stats.netProfit !== undefined && stats.netProfit !== null)
        ? safeNum(stats.netProfit)
        : liveSales * 0.3; // fallback margin estimate

    document.getElementById('stat-sales').innerText = `RM ${totalSales.toFixed(2)}`;
    document.getElementById('stat-profit').innerText = `RM ${netProfit.toFixed(2)}`;

    // ---------- DROPDOWNS (Order Form) ----------
    const customers = window.db.customers || [];
    const products = window.db.products || [];

    document.getElementById('input-customer').innerHTML = customers.length
        ? customers.map(c => `<option value="${escapeHtml(c[1])}">${escapeHtml(c[1])}</option>`).join('')
        : '<option value="">Tiada pelanggan</option>';

    document.getElementById('input-product').innerHTML = products.length
        ? products.map(p => `<option value="${escapeHtml(p[1])}">${escapeHtml(p[1])}</option>`).join('')
        : '<option value="">Tiada produk</option>';

    // ---------- PESANAN TERKINI (Dashboard) ----------
    const recentList = document.getElementById('recent-orders-list');
    if (validOrders.length === 0) {
        recentList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Tiada pesanan lagi</p>';
    } else {
        recentList.innerHTML = validOrders.map(o => {
            const payStatus = o[11] || "Unpaid";
            const netAmount = safeNum(o[8]) || safeNum(o[6]); // Net atau fallback Gross
            return `
            <div class="neu-card p-3 flex justify-between items-center text-[11px] mb-3">
                <div>
                    <p class="font-bold text-gray-700">${escapeHtml(o[2])}</p>
                    <p class="text-gray-400 text-[9px]">${escapeHtml(o[4])} x ${o[5] || 0}</p>
                    <span class="badge ${getStatusClass(o[12])}">${escapeHtml(o[12] || 'Pending')}</span>
                </div>
                <div class="text-right flex flex-col items-end">
                    <p class="font-bold text-red-500">RM ${netAmount.toFixed(2)}</p>
                    <div class="flex items-center gap-1 mt-1">
                        <span class="w-1.5 h-1.5 rounded-full ${getPaymentDot(payStatus)}"></span>
                        <span class="payment-text ${getPaymentClass(payStatus)}">${escapeHtml(payStatus)}</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // ---------- TRACKING (Delivery Page) ----------
    const trackingList = document.getElementById('tracking-list');
    if (validOrders.length === 0) {
        trackingList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Tiada pesanan untuk tracking</p>';
    } else {
        trackingList.innerHTML = validOrders.map(o => `
            <div class="neu-card p-4 space-y-2 mb-3 text-xs">
                <div class="flex justify-between items-center">
                    <b>#${escapeHtml(o[0])}</b>
                    <span class="badge ${getStatusClass(o[12])}">${escapeHtml(o[12] || 'Pending')}</span>
                </div>
                <p class="font-bold text-gray-700">${escapeHtml(o[2])} - ${escapeHtml(o[4])}</p>
                <div class="flex gap-2 pt-2 border-t border-white/20">
                    <button onclick="updateSt('${escapeHtml(o[0])}','Processing')" class="neu-btn px-2 py-1 text-[9px]">Process</button>
                    <button onclick="updateSt('${escapeHtml(o[0])}','Delivery')" class="neu-btn px-2 py-1 text-[9px]">Deliver</button>
                    <button onclick="updateSt('${escapeHtml(o[0])}','Completed')" class="neu-btn px-2 py-1 text-[9px] text-green-600 font-bold">Done</button>
                </div>
            </div>
        `).join('');
    }

    // Refresh price calculation
    if (typeof updatePrice === "function") updatePrice();
}

function toggleNewCust() {
    document.getElementById('new-cust-box').classList.toggle('hidden');
}
