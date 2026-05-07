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

async function submitCustomer() {
    // 1. Ambil nilai dari input
    const name = document.getElementById('nc-name').value;
    const cat = document.getElementById('nc-cat').value;
    const phone = document.getElementById('nc-phone').value;

    // 2. Validasi ringkas
    if (!name || !phone) {
        alert("Sila masukkan Nama dan No Telefon!");
        return;
    }

    const payload = {
        action: 'addCustomer',
        name: name,
        category: cat,
        phone: phone,
        address: "-" // Kita letak dash dulu untuk address
    };

    console.log("Menghantar data pelanggan:", payload);

    // 3. Hantar ke API
    const res = await apiPost(payload);
    
    // 4. Maklumbalas kepada pengguna
    alert("Pelanggan baru berjaya disimpan!");
    
    // 5. Reset form dan sembunyikan
    document.getElementById('nc-name').value = "";
    document.getElementById('nc-phone').value = "";
    document.getElementById('new-cust-box').classList.add('hidden');
    
    // 6. Refresh data untuk masukkan nama baru dalam dropdown
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
