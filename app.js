// =====================================================
// APP LOGIC - Form handlers & business logic
// =====================================================

/**
 * Parse harga yang mungkin number (1.5) atau string ("RM1.50").
 * Defensive — handle kedua-dua format dari Sheet.
 */
function parsePrice(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (val == null || val === '') return 0;
    const cleaned = String(val).replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Update price display bila customer/product/qty berubah
 */
function updatePrice() {
    if (!window.db) return;

    const custName = document.getElementById('input-customer').value;
    const prodName = document.getElementById('input-product').value;
    const qty = parseInt(document.getElementById('input-qty').value) || 1;

    const customer = window.db.customers.find(c => c[1] === custName);
    const product = window.db.products.find(p => p[1] === prodName);

    if (!customer || !product) return;

    const category = customer[2];

    // Update tier badge
    const badge = document.getElementById('cust-tier-badge');
    badge.innerText = `TIER: ${category}`;
    badge.className = `text-[9px] font-bold uppercase ${
        category === 'Kilang' ? 'text-orange-500' : 'text-blue-500'
    }`;

    // Pilih harga ikut category (Retail = col D index 3, Kilang = col E index 4)
    const unitPrice = parsePrice(category === 'Retail' ? product[3] : product[4]);

    window.total = unitPrice * qty;
    document.getElementById('display-total').innerText = `RM ${window.total.toFixed(2)}`;
}

// ---------- ORDER ----------

async function submitOrder() {
    if (!window.db) {
        showError("Data belum dimuatkan. Sila refresh.");
        return;
    }

    const custName = document.getElementById('input-customer').value;
    const prodName = document.getElementById('input-product').value;
    const customer = window.db.customers.find(c => c[1] === custName);

    // Validation
    if (!customer) {
        showError("Sila pilih pelanggan.");
        return;
    }
    if (!prodName) {
        showError("Sila pilih produk.");
        return;
    }
    if (!window.total || window.total <= 0) {
        showError("Total tidak sah. Sila semak kuantiti dan produk.");
        return;
    }

    const btn = event.target;
    setButtonLoading(btn, true, 'Menghantar...');

    const payload = {
        action: 'addOrder',
        custName: custName,
        category: customer[2],
        product: prodName,
        qty: parseInt(document.getElementById('input-qty').value) || 1,
        grossAmount: window.total,
        amountPaid: parseFloat(document.getElementById('input-paid').value) || 0
    };

    const res = await apiPost(payload);
    setButtonLoading(btn, false);

    if (res.result === 'success') {
        showSuccess(`Order ${res.orderId || ''} berjaya disimpan!`);
        resetOrderForm();
        await fetchInitialData();
        switchView('dashboard');
    } else {
        showError(`Gagal: ${res.error || 'Unknown error'}`);
    }
}

function resetOrderForm() {
    document.getElementById('input-qty').value = 1;
    document.getElementById('input-paid').value = '';
    window.total = 0;
    document.getElementById('display-total').innerText = 'RM 0.00';
}

// ---------- CUSTOMER ----------

async function submitCustomer() {
    const name = document.getElementById('nc-name').value.trim();
    const cat = document.getElementById('nc-cat').value;
    const phone = document.getElementById('nc-phone').value.trim();

    if (!name || !phone) {
        showError("Sila masukkan Nama dan No Telefon.");
        return;
    }

    const btn = event.target;
    setButtonLoading(btn, true, 'Menyimpan...');

    const res = await apiPost({
        action: 'addCustomer',
        name: name,
        category: cat,
        phone: phone,
        address: "-"
    });

    setButtonLoading(btn, false);

    if (res.result === 'success') {
        showSuccess("Pelanggan baru berjaya disimpan!");
        document.getElementById('nc-name').value = '';
        document.getElementById('nc-phone').value = '';
        document.getElementById('new-cust-box').classList.add('hidden');
        await fetchInitialData();
    } else {
        showError(`Gagal: ${res.error || 'Unknown error'}`);
    }
}

// ---------- DELIVERY STATUS ----------

async function updateSt(id, st) {
    const btn = event.target;
    setButtonLoading(btn, true, '...');

    const res = await apiPost({ action: 'updateStatus', orderId: id, status: st });
    setButtonLoading(btn, false);

    if (res.result === 'success') {
        showSuccess(`Status: ${st}`);
        await fetchInitialData();
    } else {
        showError(`Gagal kemaskini: ${res.error || 'Unknown error'}`);
    }
}

// ---------- EXPENSE ----------

async function submitExpense() {
    const cat = document.getElementById('exp-cat').value;
    const amt = parseFloat(document.getElementById('exp-amt').value);

    if (!amt || amt <= 0) {
        showError("Sila masukkan amaun yang sah.");
        return;
    }

    const btn = event.target;
    setButtonLoading(btn, true, 'Menyimpan...');

    const res = await apiPost({
        action: 'addExpense',
        category: cat,
        amount: amt,
        details: 'App'
    });

    setButtonLoading(btn, false);

    if (res.result === 'success') {
        showSuccess("Kos disimpan!");
        document.getElementById('exp-amt').value = '';
        await fetchInitialData();
    } else {
        showError(`Gagal: ${res.error || 'Unknown error'}`);
    }
}

// ---------- BUTTON STATE HELPER ----------

function setButtonLoading(btn, loading, loadingText) {
    if (!btn) return;
    if (loading) {
        btn.dataset.originalText = btn.innerText;
        btn.innerText = loadingText || 'Loading...';
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
    } else {
        btn.innerText = btn.dataset.originalText || btn.innerText;
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = '';
    }
}
