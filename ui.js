function switchView(v) {
    document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-'+v).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-'+v).classList.add('active');
    document.getElementById('current-view-title').innerText = v.toUpperCase();
}

function renderUI() {
    if(!window.db) return;
    
    // Stats
    document.getElementById('stat-sales').innerText = `RM ${window.db.summary[1][1] || 0}`;
    document.getElementById('stat-profit').innerText = `RM ${window.db.summary[1][4] || 0}`;

    // Dropdowns
    document.getElementById('input-customer').innerHTML = window.db.customers.map(c => `<option value="${c[1]}">${c[1]}</option>`).join('');
    document.getElementById('input-product').innerHTML = window.db.products.map(p => `<option value="${p[1]}">${p[1]}</option>`).join('');

    // Recent Orders
    const validOrders = window.db.orders.filter(o => o[0] !== "");
    document.getElementById('recent-orders-list').innerHTML = validOrders.map(o => `
        <div class="neu-card p-3 flex justify-between items-center text-[11px]">
            <div><p class="font-bold">${o[2]}</p><p class="text-gray-400">${o[4]} x ${o[5]}</p></div>
            <div class="text-right"><p class="font-bold text-red-500">RM ${o[8]}</p><span class="badge st-${o[12].toLowerCase()}">${o[12]}</span></div>
        </div>
    `).join('');

    // Tracking
    document.getElementById('view-tracking').innerHTML = validOrders.map(o => `
        <div class="neu-card p-4 flex justify-between items-center text-[11px] mb-3">
            <div class="space-y-1">
                <p class="font-bold text-gray-700 leading-tight">${o[2]}</p>
                <p class="text-gray-400 text-[9px]">${o[4]} x ${o[5]}</p>
                <!-- Tambah Status Delivery di bawah info produk -->
                <span class="badge ${getStatusClass(o[12])}">${o[12] || 'Pending'}</span>
            </div>
            
            <div class="text-right flex flex-col items-end space-y-1">
                <p class="font-bold text-gray-800 text-sm">RM ${parseFloat(o[8]).toFixed(2)}</p>
                <!-- Indikator Bayaran yang Jelas -->
                <div class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full ${payStatus === 'Paid' ? 'bg-green-500' : payStatus === 'Partial' ? 'bg-orange-500' : 'bg-red-500'}"></span>
                    <span class="payment-text ${payClass}">${payStatus}</span>
                </div>
            </div>
        </div>
    `;
}).join('');
    
    updatePrice();
}

function toggleNewCust() { document.getElementById('new-cust-box').classList.toggle('hidden'); }
