function switchView(view) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`nav-${view}`).classList.add('active');
    
    const titles = { dashboard: 'Dashboard', order: 'Order Form', tracking: 'Delivery', report: 'Report' };
    document.getElementById('current-view-title').innerText = titles[view];
}

function renderInitialUI() {
    if (!window.db) return;

    // 1. Update Stats (Dari tab Summary)
    // Pastikan Summary ditarik dengan betul (Baris 2, Kolum 1 dan 4)
    const salesToday = window.db.summary[1] ? window.db.summary[1][1] : 0;
    const profitToday = window.db.summary[1] ? window.db.summary[1][4] : 0;
    
    document.getElementById('stat-sales').innerText = `RM ${salesToday}`;
    document.getElementById('stat-profit').innerText = `RM ${profitToday}`;

    // 2. Update Dropdowns
    const custSelect = document.getElementById('input-customer');
    const prodSelect = document.getElementById('input-product');
    custSelect.innerHTML = window.db.customers.map(c => `<option value="${c[1]}">${c[1]}</option>`).join('');
    prodSelect.innerHTML = window.db.products.map(p => `<option value="${p[1]}">${p[1]}</option>`).join('');

    // Tapis pesanan (Hanya ambil baris yang ada Order_ID)
    const validOrders = window.db.orders.filter(o => o[0] !== "");

    // 3. Render Pesanan Terkini (Dashboard)
    const recentList = document.getElementById('recent-orders-list');
    recentList.innerHTML = validOrders.length > 0 ? validOrders.map(o => `
        <div class="neu-card p-4 flex justify-between items-center text-[11px] mb-3">
            <div>
                <p class="font-bold text-gray-700">${o[2]}</p>
                <p class="text-gray-400">${o[4]} x ${o[5]}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-red-500">RM ${parseFloat(o[8]).toFixed(2)}</p>
                <span class="badge ${getStatusClass(o[12])}">${o[12] || 'Pending'}</span>
            </div>
        </div>
    `).join('') : `<p class="text-center text-gray-400 text-xs py-4">Tiada pesanan hari ini.</p>`;

    // 4. Render Tracking List (Delivery)
    const trackingList = document.getElementById('tracking-list');
    trackingList.innerHTML = validOrders.length > 0 ? validOrders.map(o => `
        <div class="neu-card p-5 space-y-3 mb-4">
            <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold text-gray-400">#${o[0]}</span>
                <span class="badge ${getStatusClass(o[12])}">${o[12] || 'Pending'}</span>
            </div>
            <p class="text-sm font-bold text-gray-700">${o[2]}</p>
            <div class="grid grid-cols-3 gap-2 mt-2">
                <button onclick="changeDeliveryStatus('${o[0]}', 'Processing')" class="neu-btn py-2 text-[9px] font-bold">PROCESS</button>
                <button onclick="changeDeliveryStatus('${o[0]}', 'Delivery')" class="neu-btn py-2 text-[9px] font-bold">DELIVER</button>
                <button onclick="changeDeliveryStatus('${o[0]}', 'Completed')" class="neu-btn py-2 text-[9px] font-bold text-green-600">DONE</button>
            </div>
        </div>
    `).join('') : `<p class="text-center text-gray-400 text-xs py-10">Tiada barang untuk dihantar.</p>`;
}

function getStatusClass(status) {
    status = String(status).toLowerCase();
    if (status === 'pending') return 'status-pending';
    if (status === 'delivery') return 'status-delivery';
    if (status === 'completed') return 'status-completed';
    return 'status-processing';
}

// Helper untuk warna badge
function getStatusClass(status) {
    if (status === 'Pending') return 'status-pending';
    if (status === 'Delivery') return 'status-delivery';
    if (status === 'Completed') return 'status-completed';
    return 'status-processing';
}
