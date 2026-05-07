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

function safeNum(val) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
    return escapeHtml(str);
}

/**
 * Format date safely - handles ISO string, Date object, or empty
 */
function formatDate(val) {
    if (!val) return '-';
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('en-MY', {
            day: '2-digit', month: 'short', year: '2-digit'
        });
    } catch { return '-'; }
}

/**
 * Count returns per order ID (untuk tunjuk badge dalam tracking)
 */
function countReturns(orderId, returns) {
    return (returns || []).filter(r => r[1] === orderId).length;
}

// =====================================================
// MAIN RENDER
// =====================================================

function renderUI() {
    if (!window.db) return;

    const validOrders = (window.db.orders || []).filter(o => o && o[0]);
    const allReturns = window.db.returns || [];

    renderDashboard(validOrders);
    renderDropdowns();
    renderRecentOrders(validOrders);
    renderTracking(validOrders, allReturns);
    renderStockSection();
    renderReturnsHistory(allReturns);

    if (typeof updatePrice === "function") updatePrice();
}

// ---------- DASHBOARD STATS ----------

function renderDashboard(validOrders) {
    const stats = window.db.stats || {};
    const liveSales = validOrders.reduce((sum, o) => sum + safeNum(o[6]), 0);

    const totalSales = safeNum(stats.totalSales) || liveSales;
    const netProfit = (stats.netProfit !== undefined && stats.netProfit !== null)
        ? safeNum(stats.netProfit)
        : liveSales * 0.3;

    document.getElementById('stat-sales').innerText = `RM ${totalSales.toFixed(2)}`;
    document.getElementById('stat-profit').innerText = `RM ${netProfit.toFixed(2)}`;
}

// ---------- DROPDOWNS ----------

function renderDropdowns() {
    const customers = window.db.customers || [];
    const products = window.db.products || [];

    document.getElementById('input-customer').innerHTML = customers.length
        ? customers.map(c => `<option value="${escapeAttr(c[1])}">${escapeHtml(c[1])}</option>`).join('')
        : '<option value="">Tiada pelanggan</option>';

    document.getElementById('input-product').innerHTML = products.length
        ? products.map(p => `<option value="${escapeAttr(p[1])}">${escapeHtml(p[1])}</option>`).join('')
        : '<option value="">Tiada produk</option>';
}

// ---------- RECENT ORDERS (Dashboard) ----------

function renderRecentOrders(validOrders) {
    const recentList = document.getElementById('recent-orders-list');

    if (validOrders.length === 0) {
        recentList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Tiada pesanan lagi</p>';
        return;
    }

    recentList.innerHTML = validOrders.map(o => {
        const payStatus = o[11] || "Unpaid";
        const netAmount = safeNum(o[8]) || safeNum(o[6]);
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

// ---------- TRACKING (with Return button) ----------

function renderTracking(validOrders, allReturns) {
    const trackingList = document.getElementById('tracking-list');

    if (validOrders.length === 0) {
        trackingList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Tiada pesanan untuk tracking</p>';
        return;
    }

    trackingList.innerHTML = validOrders.map(o => {
        const orderId = o[0];
        const product = o[4];
        const qty = o[5] || 0;
        const returnCount = countReturns(orderId, allReturns);
        const returnBadge = returnCount > 0
            ? `<span class="badge bg-red-100 text-red-700">↺ ${returnCount}</span>`
            : '';

        return `
            <div class="neu-card p-4 space-y-2 mb-3 text-xs">
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <b>#${escapeHtml(orderId)}</b>
                        ${returnBadge}
                    </div>
                    <span class="badge ${getStatusClass(o[12])}">${escapeHtml(o[12] || 'Pending')}</span>
                </div>
                <p class="font-bold text-gray-700">${escapeHtml(o[2])} - ${escapeHtml(product)} (${qty})</p>
                <div class="flex flex-wrap gap-2 pt-2 border-t border-white/20">
                    <button onclick="updateSt('${escapeAttr(orderId)}','Processing')" class="neu-btn px-2 py-1 text-[9px]">Process</button>
                    <button onclick="updateSt('${escapeAttr(orderId)}','Delivery')" class="neu-btn px-2 py-1 text-[9px]">Deliver</button>
                    <button onclick="updateSt('${escapeAttr(orderId)}','Completed')" class="neu-btn px-2 py-1 text-[9px] text-green-600 font-bold">Done</button>
                    <button onclick="openReturnModal('${escapeAttr(orderId)}','${escapeAttr(product)}',${qty})" class="neu-btn px-2 py-1 text-[9px] text-orange-600 font-bold">↺ Return</button>
                </div>
            </div>
        `;
    }).join('');
}

// ---------- STOCK SECTION (Reports page) ----------

function renderStockSection() {
    const stockList = document.getElementById('stock-list');
    if (!stockList) return;

    const products = window.db.products || [];

    if (products.length === 0) {
        stockList.innerHTML = '<p class="text-gray-400 text-xs text-center py-4">Tiada produk</p>';
        return;
    }

    stockList.innerHTML = products.map(p => {
        const name = p[1];
        const stock = parseInt(p[5]) || 0;
        const stockColor = stock <= 0 ? 'text-red-500'
                        : (stock < 10 ? 'text-orange-500' : 'text-green-600');
        const inputId = `restock-input-${cssEscape(name)}`;

        return `
            <div class="neu-card p-3 mb-2 text-xs">
                <div class="flex justify-between items-center mb-2">
                    <p class="font-bold text-gray-700">${escapeHtml(name)}</p>
                    <span class="font-bold ${stockColor}">Stok: ${stock}</span>
                </div>
                <div class="flex gap-2">
                    <input type="number" id="${inputId}" class="neu-input flex-1 text-xs" placeholder="Tambah qty" min="1">
                    <button onclick="submitRestock('${escapeAttr(name)}')" class="neu-btn px-3 py-1 text-[10px] font-bold text-blue-600">+ Restock</button>
                </div>
            </div>
        `;
    }).join('');
}

// ---------- RETURNS HISTORY (Reports page) ----------

function renderReturnsHistory(allReturns) {
    const list = document.getElementById('returns-list');
    if (!list) return;

    if (!allReturns || allReturns.length === 0) {
        list.innerHTML = '<p class="text-gray-400 text-xs text-center py-3">Tiada return setakat ini</p>';
        return;
    }

    list.innerHTML = allReturns.map(r => `
        <div class="neu-card p-3 mb-2 text-[11px]">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-gray-700">${escapeHtml(r[1])}</p>
                    <p class="text-gray-500 text-[9px]">${escapeHtml(r[4] || '-')}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-orange-600">${r[3] || 0} unit</p>
                    <p class="text-gray-400 text-[9px]">${formatDate(r[2])}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------- TOGGLES ----------

function toggleNewCust() {
    document.getElementById('new-cust-box').classList.toggle('hidden');
}

function toggleSection(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden');
}
