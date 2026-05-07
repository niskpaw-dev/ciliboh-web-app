function updatePrice() {
    const custName = document.getElementById('input-customer').value;
    const prodName = document.getElementById('input-product').value;
    const qty = document.getElementById('input-qty').value || 1;

    // 1. Cari data pelanggan yang dipilih
    const customer = window.db.customers.find(c => c[1] === custName);
    // 2. Cari data produk yang dipilih
    const product = window.db.products.find(p => p[1] === prodName);

    if (customer && product) {
        const category = customer[2]; // Contoh: 'Retail' atau 'Kilang'
        
        // 3. Update Badge di UI
        const badge = document.getElementById('cust-tier-badge');
        badge.innerText = `TIER: ${category}`;
        badge.className = `text-[9px] font-bold uppercase ${category === 'Kilang' ? 'text-orange-500' : 'text-blue-500'}`;

        // 4. Pilih Harga berdasarkan Kategori
        // Ikut susunan kolum Tab Products: [ID, Nama, Berat, Harga_Retail, Harga_Kilang]
        const unitPrice = (category === 'Retail') ? product[3] : product[4];
        
        window.total = unitPrice * qty;
        document.getElementById('display-total').innerText = `RM ${window.total.toFixed(2)}`;
    }
}

async function submitOrder() {
    const payload = {
        action: 'addOrder',
        custName: document.getElementById('input-customer').value,
        category: window.db.customers.find(c => c[1] === document.getElementById('input-customer').value)[2],
        product: document.getElementById('input-product').value,
        qty: document.getElementById('input-qty').value,
        grossAmount: window.total,
        amountPaid: document.getElementById('input-paid').value || 0
    };
    await apiPost(payload);
    alert("Order Disimpan!");
    location.reload();
}

async function submitNewCustomer() {
    const payload = {
        action: 'addCustomer',
        name: document.getElementById('nc-name').value,
        category: document.getElementById('nc-cat').value, // Ambil 'Retail' atau 'Kilang'
        phone: document.getElementById('nc-phone').value,
        address: "-"
    };
    await apiPost(payload);
    alert("Pelanggan Baru Berjaya Didaftar!");
    location.reload();
}
async function updateSt(id, st) {
    await apiPost({action:'updateStatus', orderId: id, status: st});
    alert("Status Kemaskini!");
    location.reload();
}

async function submitExpense() {
    await apiPost({action:'addExpense', category: document.getElementById('exp-cat').value, amount: document.getElementById('exp-amt').value, details: 'App'});
    alert("Kos Disimpan!");
    location.reload();
}
