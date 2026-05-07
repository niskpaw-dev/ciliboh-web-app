// =====================================================
// APP LOGIC - Form handlers & business logic
// v2.1: WhatsApp click-to-chat integration
// =====================================================

function parsePrice(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (val == null || val === '') return 0;
    const cleaned = String(val).replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

// ---------- ORDER FORM ----------

function updatePrice() {
    if (!window.db) return;

    const custName = document.getElementById('input-customer').value;
    const prodName = document.getElementById('input-product').value;
    const qty = parseInt(document.getElementById('input-qty').value) || 1;

    const customer = window.db.customers.find(c => c[1] === custName);
    const product = window.db.products.find(p => p[1] === prodName);

    if (!customer || !product) return;

    const category = customer[2];

    const badge = document.getElementById('cust-tier-badge');
    badge.innerText = `TIER: ${category}`;
    badge.className = `text-[9px] font-bold uppercase ${
        category === 'Kilang' ? 'text-orange-500' : 'text-blue-500'
    }`;

    const unitPrice = parsePrice(category === 'Retail' ? product[3] : product[4]);

    window.total = unitPrice * qty;
    document.getElementById('display-total').innerText = `RM ${window.total.toFixed(2)}`;

    const stock = parseInt(product[5]) || 0;
    const stockEl = document.getElementById('product-stock');
    if (stockEl) {
        stockEl.innerText = `STOK: ${stock}`;
        stockEl.className = `text-[9px] font-bold uppercase ${
            stock <= 0 ? 'text-red-500' : (stock < 10 ? 'text-orange-500' : 'text-gray-500')
        }`;
    }
}

async function submitOrder() {
    if (!window.db) {
        showError("Data belum dimuatkan. Sila refresh.");
        return;
    }

    const custName = document.getElementById('input-customer').value;
    const prodName = document.getElementById('input-product').value;
    const customer = window.db.customers.find(c => c[1] === custName);

    if (!customer) { showError("Sila pilih pelanggan."); return; }
    if (!prodName) { showError("Sila pilih produk."); return; }
    if (!window.total || window.total <= 0) {
        showError("Total tidak sah. Sila semak kuantiti dan produk.");
        return;
    }

    const btn = event.target;
    setButtonLoading(btn, true, 'Menghantar...');

    const qty = parseInt(document.getElementById('input-qty').value) || 1;
    const paid = parseFloat(document.getElementById('input-paid').value) || 0;
    const total = window.total;

    const payload = {
        action: 'addOrder',
        custName: custName,
        category: customer[2],
        product: prodName,
        qty: qty,
        grossAmount: total,
        amountPaid: paid
    };

    const res = await apiPost(payload);
    setButtonLoading(btn, false);

    if (res.result === 'success') {
        const orderId = res.orderId;
        const hasPhone = customer[3] && String(customer[3]).trim();

        // Combined success + WA prompt (kurangkan jumlah popup)
        let promptMsg = `✓ Order ${orderId} berjaya disimpan!`;
        if (res.stockWarning) promptMsg += `\n⚠️ ${res.stockWarning}`;

        if (hasPhone) {
            promptMsg += `\n\nHantar confirmation WhatsApp ke ${custName}?`;
            if (confirm(promptMsg)) {
                sendConfirmation(orderId, custName, prodName, qty, total, paid);
            }
        } else {
            alert(promptMsg);
        }

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
        name: name, category: cat, phone: phone, address: "-"
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
        action: 'addExpense', category: cat, amount: amt, details: 'App'
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

// ---------- RETURNS ----------

function openReturnModal(orderId, productName, originalQty) {
    document.getElementById('rt-order-id').innerText = orderId;
    document.getElementById('rt-product-name').innerText = productName;
    document.getElementById('rt-original-qty').innerText = originalQty;
    document.getElementById('rt-order-id-hidden').value = orderId;
    document.getElementById('rt-product-hidden').value = productName;
    document.getElementById('rt-qty').value = 1;
    document.getElementById('rt-reason').value = 'Pakej Pecah';
    document.getElementById('return-modal').classList.remove('hidden');
}

function closeReturnModal() {
    document.getElementById('return-modal').classList.add('hidden');
}

async function submitReturn() {
    const orderId = document.getElementById('rt-order-id-hidden').value;
    const product = document.getElementById('rt-product-hidden').value;
    const qty = parseInt(document.getElementById('rt-qty').value);
    const reason = document.getElementById('rt-reason').value;

    if (!qty || qty <= 0) {
        showError("Sila masukkan kuantiti yang sah.");
        return;
    }

    const btn = event.target;
    setButtonLoading(btn, true, 'Menyimpan...');

    const res = await apiPost({
        action: 'addReturn',
        orderId: orderId, product: product, qty: qty, reason: reason
    });

    setButtonLoading(btn, false);

    if (res.result === 'success') {
        showSuccess(`Return ${res.returnId} direkodkan. Stok baki: ${res.newStock}`);
        closeReturnModal();
        await fetchInitialData();
    } else {
        showError(`Gagal: ${res.error || 'Unknown error'}`);
    }
}

// ---------- RESTOCK ----------

async function submitRestock(productName) {
    const inputId = `restock-input-${cssEscape(productName)}`;
    const input = document.getElementById(inputId);
    const qty = parseInt(input.value);

    if (!qty || qty <= 0) {
        showError("Sila masukkan kuantiti yang sah.");
        return;
    }

    const btn = event.target;
    setButtonLoading(btn, true, '...');

    const res = await apiPost({
        action: 'restock', product: productName, qty: qty
    });

    setButtonLoading(btn, false);

    if (res.result === 'success') {
        showSuccess(`Stok ${productName} sekarang: ${res.newStock}`);
        input.value = '';
        await fetchInitialData();
    } else {
        showError(`Gagal: ${res.error || 'Unknown error'}`);
    }
}

// =====================================================
// WHATSAPP CLICK-TO-CHAT (v2.1)
// =====================================================

/**
 * Normalize phone number ke format WhatsApp wa.me (international, no +).
 * Handle: "0123456789", "+60123456789", "60-123-456789", etc.
 */
function formatPhone(phone) {
    if (!phone) return null;
    let cleaned = String(phone).replace(/[^\d]/g, '');
    if (!cleaned) return null;
    // Kalau start dengan 60, dah ada country code
    if (cleaned.startsWith('60')) return cleaned;
    // Kalau start dengan 0, ganti dengan 60 (Malaysia)
    if (cleaned.startsWith('0')) return '60' + cleaned.substring(1);
    // Default: assume Malaysia, prepend 60
    return '60' + cleaned;
}

/**
 * Generic WhatsApp opener. Cari customer phone, buka wa.me dengan mesej.
 */
function sendWhatsApp(custName, message) {
    const customer = window.db.customers.find(c => c[1] === custName);
    if (!customer) {
        showError(`Pelanggan tidak dijumpai: ${custName}`);
        return;
    }

    const phone = formatPhone(customer[3]);
    if (!phone) {
        showError(`Nombor telefon tidak sah untuk ${custName}`);
        return;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ---------- MESSAGE BUILDERS ----------

function buildConfirmation(orderId, custName, product, qty, total, paid) {
    const balance = total - paid;
    return `Salam ${custName},
Order #${orderId} dah diterima ✓

Produk: ${product} x ${qty}
Total: RM ${total.toFixed(2)}
Bayar: RM ${paid.toFixed(2)}
Baki: RM ${balance.toFixed(2)}

Status: Pending
Akan kemaskini bila siap diproses 🌶️

- Cili Boh`;
}

function buildStatusUpdate(orderId, custName, status) {
    if (status === 'Processing') {
        return `Salam ${custName},
Order #${orderId} sedang diproses 🔄

Akan inform bila siap untuk hantar.

- Cili Boh`;
    }
    if (status === 'Delivery') {
        return `Salam ${custName},
Order #${orderId} dah dihantar 🚚

Sila confirm bila terima ya.

- Cili Boh`;
    }
    if (status === 'Completed') {
        return `Salam ${custName},
Order #${orderId} dah selesai ✓
Terima kasih atas sokongan! 🙏

- Cili Boh`;
    }
    // Default (Pending atau status tak dikenali)
    return `Salam ${custName},
Update Order #${orderId}
Status sekarang: ${status}

- Cili Boh`;
}

function buildPaymentReminder(orderId, custName, total, paid) {
    const balance = total - paid;
    return `Salam ${custName},
Reminder untuk Order #${orderId}

Total: RM ${total.toFixed(2)}
Bayar: RM ${paid.toFixed(2)}
Baki: RM ${balance.toFixed(2)}

Boleh transfer? Terima kasih 🙏

- Cili Boh`;
}

// ---------- ENTRY POINTS (dipanggil dari UI) ----------

function sendConfirmation(orderId, custName, product, qty, total, paid) {
    const message = buildConfirmation(orderId, custName, product, qty, total, paid);
    sendWhatsApp(custName, message);
}

/**
 * Hantar status update — pilih mesej ikut current delivery status.
 * Dipanggil dari tracking card.
 */
function sendStatusWA(orderId) {
    const order = (window.db.orders || []).find(o => o[0] === orderId);
    if (!order) {
        showError("Order tidak dijumpai.");
        return;
    }
    const custName = order[2];
    const status = order[12] || 'Pending';
    const message = buildStatusUpdate(orderId, custName, status);
    sendWhatsApp(custName, message);
}

/**
 * Hantar payment reminder. Dipanggil dari dashboard recent orders.
 */
function sendPaymentReminderForOrder(orderId) {
    const order = (window.db.orders || []).find(o => o[0] === orderId);
    if (!order) {
        showError("Order tidak dijumpai.");
        return;
    }
    const custName = order[2];
    const total = parseFloat(order[8]) || parseFloat(order[6]) || 0;
    const paid = parseFloat(order[9]) || 0;
    const message = buildPaymentReminder(orderId, custName, total, paid);
    sendWhatsApp(custName, message);
}

// ---------- HELPERS ----------

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

function cssEscape(str) {
    return String(str || '').replace(/[^a-zA-Z0-9]/g, '_');
}
