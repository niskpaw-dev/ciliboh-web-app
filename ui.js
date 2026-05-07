function switchView(v) {
    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-' + v).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + v).classList.add('active');
    document.getElementById('current-view-title').innerText = v.toUpperCase();
}

function getStatusClass(st) {
    const s = String(st).toLowerCase();
    if (s === 'pending') return 'st-pending';
    if (s === 'delivery') return 'st-delivery';
    if (s === 'completed') return 'st-completed';
    return 'st-processing';
}

function renderUI() {
    if (!window.db) return;

    // 1. Tapis data order yang sah (Hanya isytihar SEKALI di sini)
    const validOrders = window.db.orders.filter(o => o[0] !== "");

    // 2. KIRA TOTAL SALES & PROFIT SECARA LIVE
    const liveSales = validOrders.reduce((sum, o) => sum + parseFloat(o[6] || 0), 0);
    const liveProfit = window.db.summary[1] ? window.db.summary[1][4] : (liveSales * 0.3).toFixed(2);

    document.getElementById('stat-sales').innerText = `RM ${liveSales.toFixed(2)}`;
    document.getElementById('stat-profit').innerText = `RM ${liveProfit}`;

    // 3. KEMASKINI DROPDOWNS (ORDER FORM)
    document.getElementById('input-customer').innerHTML = window.db.customers.map(c => `<option value="${c[1]}">${c[1]}</option>`).join('');
    document.getElementById('input-product').innerHTML = window.db.products.map(p => `<option value="${p[1]}">${p[1]}</option>`).join('');

    // 4. PAPARAN PESANAN TERKINI (DASHBOARD)
    document.getElementById('recent-orders-list').innerHTML = validOrders.map(o => {
        const payStatus = o[11] || "Unpaid";
        const payClass = payStatus === "Paid" ? "pay-paid" : (payStatus === "Partial" ? "pay-partial" : "pay-unpaid");
        const dotColor = payStatus === 'Paid' ? 'bg-green-500' : (payStatus === 'Partial' ? 'bg-orange-500' : 'bg-red-500');

        return `
        <div class="neu-card p-3 flex justify-between items-center text-[11px] mb-3">
            <div>
                <p class="font-bold text-gray-700">${o[2]}</p>
                <p class="text-gray-400 text-[9px]">${o[4]} x ${o[5]}</p>
                <span class="badge ${getStatusClass(o[12])}">${o[12] || 'Pending'}</span>
            </div>
            <div class="text-right flex flex-col items-end">
                <p class="font-bold text-red-500">RM ${parseFloat(o[8]).toFixed(2)}</p>
                <div class="flex items-center gap-1 mt-1">
                    <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                    <span class="payment-text ${payClass}">${payStatus}</span>
                </div>
            </div>
        </div>`;
    }).join('');

    // 5. PAPARAN TRACKING (DELIVERY PAGE)
    document.getElementById('view-tracking').innerHTML = validOrders.map(o => `
        <div class="neu-card p-4 space-y-2 mb-3 text-xs">
            <div class="flex justify-between items-center">
                <b>#${o[0]}</b> 
                <span class="badge ${getStatusClass(o[12])}">${o[12] || 'Pending'}</span>
            </div>
            <p class="font-bold text-gray-700">${o[2]} - ${o[4]}</p>
            <div class="flex gap-2 pt-2 border-t border-white/20">
                <button onclick="updateSt('${o[0]}','Processing')" class="neu-btn px-2 py-1 text-[9px]">Process</button>
                <button onclick="updateSt('${o[0]}','Delivery')" class="neu-btn px-2 py-1 text-[9px]">Deliver</button>
                <button onclick="updateSt('${o[0]}','Completed')" class="neu-btn px-2 py-1 text-[9px] text-green-600 font-bold">Done</button>
            </div>
        </div>
    `).join('');

    if (typeof updatePrice === "function") updatePrice();
}

function toggleNewCust() { 
    document.getElementById('new-cust-box').classList.toggle('hidden'); 
}
