const API_URL = 'URL_WEB_APP_ANDA'; // GANTI DENGAN URL ANDA

async function fetchInitialData() {
    try {
        const res = await fetch(`${API_URL}?action=getInitialData`);
        const data = await res.json();
        window.db = data; // Simpan data global
        renderInitialUI();
    } catch (err) {
        console.error("Gagal tarik data", err);
    }
}

async function apiPost(payload) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return await res.json();
    } catch (err) {
        console.error("API Error", err);
    }
}

// Panggil data masa mula
fetchInitialData();
