function switchView(view) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`nav-${view}`).classList.add('active');
    
    const titles = { dashboard: 'Dashboard', order: 'Order Form', tracking: 'Delivery', report: 'Report' };
    document.getElementById('current-view-title').innerText = titles[view];
}

function renderInitialUI() {
    const custSelect = document.getElementById('input-customer');
    const prodSelect = document.getElementById('input-product');
    
    // Fill Customers
    custSelect.innerHTML = window.db.customers.map(c => `<option value="${c[1]}">${c[1]}</option>`).join('');
    
    // Fill Products
    prodSelect.innerHTML = window.db.products.map(p => `<option value="${p[1]}">${p[1]}</option>`).join('');
    
    // Fill Stats
    document.getElementById('stat-sales').innerText = `RM ${window.db.summary[1][1]}`;
    document.getElementById('stat-profit').innerText = `RM ${window.db.summary[1][4]}`;

    updatePrice();
}
