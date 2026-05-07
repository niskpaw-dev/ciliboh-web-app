function updatePrice() {
    const cust = window.db.customers.find(c => c[1] === document.getElementById('input-customer').value);
    const prod = window.db.products.find(p => p[1] === document.getElementById('input-product').value);
    const qty = document.getElementById('input-qty').value;
    if(cust && prod) {
        const price = cust[2] === 'Retail' ? prod[3] : prod[4];
        window.total = price * qty;
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
    const payload = {
        action: 'addCustomer',
        name: document.getElementById('nc-name').value,
        category: document.getElementById('nc-cat').value,
        phone: document.getElementById('nc-phone').value
    };
    await apiPost(payload);
    alert("Pelanggan Ditambah!");
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
