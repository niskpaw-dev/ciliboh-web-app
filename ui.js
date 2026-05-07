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
    document.getElementById('stat-sales').innerText = `RM ${window.db.summary[1][1] || 0}`;
    document.getElementById('stat-profit').innerText = `RM ${window.db.summary[1][4] || 0}`;

    // 2. Update Dropdowns (Order Form)
    const custSelect = document.getElementById('input-customer');
    const prodSelect = document.getElementById('input-product');
    custSelect.innerHTML = window.db.customers.map(c => `<option value="${c[1]}">${c[1]}</option>`).join('');
    prodSelect.innerHTML = window.db.products.map(p => `<option value="${p[1]}">${p[1]}</option>`).join('');

    // 3. Update Pesanan Terkini (Dashboard)
    const recentList = document.getElementById('recent-orders-list');
    if (window.db.orders.length > 0) {
        recentList.innerHTML = window.db.orders.map(o => `
            <div class="neu-card p-3 flex justify-between items-center text-[10px]">
                <div>
                    <span class="font-bold text-gray-700">${o[2]}</span><br>
                    <span class="text-gray-400">${o[4]} x ${o[5]}</span>
                </div>
                <div class="text-right">
                    <span class="font-bold text-red-500">RM ${o[8]}</span><br>
                    <span class="badge ${getStatusClass(o[12])}">${o[12] || 'Pending'}</span>
                </div>
            </div>
        `).join('');
    } else {
        recentList.innerHTML = `<p class="text-center text-gray-400 text-xs py-4">Tiada pesanan ditemui.</p>`;
    }

    // 4. Update Tracking List
    const trackingList = document.getElementById('tracking-list');
    trackingList.innerHTML = window.db.orders.map(o => `
        <div class="neu-card p-4 space-y-2">
            <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold text-gray-400">#${o[0]}</span>
                <span class="badge ${getStatusClass(o[12])}">${o[12] || 'Pending'}</span>
            </div>
            <p class="text-xs font-bold text-gray-700">${o[2]}</p>
            <div class="flex gap-2 mt-2">
                <button onclick="updateStatus('${o[0]}', 'Processing')" class="btn-status">Process</button>
                <button onclick="updateStatus('${o[0]}', 'Delivery')" class="btn-status">Deliver</button>
                <button onclick="updateStatus('${o[0]}', 'Completed')" class="btn-status text-green-600">Done</button>
            </div>
        </div>
    `).join('');
}

// Helper untuk warna badge
function getStatusClass(status) {
    if (status === 'Pending') return 'status-pending';
    if (status === 'Delivery') return 'status-delivery';
    if (status === 'Completed') return 'status-completed';
    return 'status-processing';
}
