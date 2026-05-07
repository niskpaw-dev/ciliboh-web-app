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
        <div class="neu-card p-4 space-y-2 mb-3 text-xs">
            <div class="flex justify-between"><b>#${o[0]}</b> <span class="badge st-${o[12].toLowerCase()}">${o[12]}</span></div>
            <p>${o[2]} - ${o[4]}</p>
            <div class="flex gap-2">
                <button onclick="updateSt('${o[0]}','Processing')" class="neu-btn px-2 py-1">Process</button>
                <button onclick="updateSt('${o[0]}','Delivery')" class="neu-btn px-2 py-1">Deliver</button>
                <button onclick="updateSt('${o[0]}','Completed')" class="neu-btn px-2 py-1 text-green-600">Done</button>
            </div>
        </div>
    `).join('');
    
    updatePrice();
}

function toggleNewCust() { document.getElementById('new-cust-box').classList.toggle('hidden'); }
