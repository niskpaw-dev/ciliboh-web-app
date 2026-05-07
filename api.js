const API_URL = 'https://script.google.com/macros/s/AKfycbyy2SflnvVyajIcveKivKKu5B7KwJxShnKPbQMr6XJhwPZKCrBCSurciesFLraruVXhmQ/exec'; // GANTI DENGAN URL ANDA

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
        const response = await fetch(API_URL, {
            method: 'POST',
            // Kita gunakan mode 'no-cors' jika POST biasa gagal, 
            // tetapi untuk Apps Script, mode default (cors) biasanya OK jika setting 'Anyone' betul.
            body: JSON.stringify(payload)
        });
        
        // Kerana Apps Script akan redirect, kita tak perlukan res.json() sangat untuk POST
        return { result: 'success' }; 
    } catch (err) {
        console.error("Ralat Penghantaran:", err);
        return { result: 'error' };
    }
}

// Panggil data masa mula
fetchInitialData();
