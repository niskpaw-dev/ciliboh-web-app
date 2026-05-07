function updatePrice() {
    const custName = document.getElementById('input-customer').value;
    const prodName = document.getElementById('input-product').value;
    const qty = document.getElementById('input-qty').value;

    const customer = window.db.customers.find(c => c[1] === custName);
    const product = window.db.products.find(p => p[1] === prodName);

    if (customer && product) {
        const price = customer[2] === 'Retail' ? product[3] : product[4];
        window.currentTotal = price * qty;
        document.getElementById('display-total').innerText = `RM ${window.currentTotal.toFixed(2)}`;
    }
}

async function submitOrder() {
    const payload = {
        action: 'addOrder',
        custName: document.getElementById('input-customer').value,
        category: window.db.customers.find(c => c[1] === document.getElementById('input-customer').value)[2],
        product: document.getElementById('input-product').value,
        qty: document.getElementById('input-qty').value,
        grossAmount: window.currentTotal,
        amountPaid: document.getElementById('input-paid').value || 0
    };

    const res = await apiPost(payload);
    if (res.result === 'success') {
        alert(`Order ${res.orderId} Berjaya!`);
        location.reload(); // Refresh untuk update data
    }
}

async function handleExpense() {
    const payload = {
        action: 'addExpense',
        category: document.getElementById('exp-category').value,
        amount: document.getElementById('exp-amount').value,
        details: 'Dibuat dari App'
    };
    const res = await apiPost(payload);
    if (res.result === 'success') alert("Kos berjaya disimpan!");
}
async function changeDeliveryStatus(orderId, newStatus) {
    if(!confirm(`Tukar status order ${orderId} kepada ${newStatus}?`)) return;

    const payload = {
        action: 'updateDeliveryStatus',
        orderId: orderId,
        status: newStatus
    };

    const res = await apiPost(payload);
    if (res.result === 'success') {
        alert("Status dikemaskini!");
        location.reload(); 
    }
}
