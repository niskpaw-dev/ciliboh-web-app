const API_URL = 'https://script.google.com/macros/s/AKfycbyy2SflnvVyajIcveKivKKu5B7KwJxShnKPbQMr6XJhwPZKCrBCSurciesFLraruVXhmQ/exec';

async function fetchInitialData() {
    try {
        const res = await fetch(`${API_URL}?action=getInitialData`);
        window.db = await res.json();
        renderUI();
    } catch (e) { console.error(e); }
}

async function apiPost(payload) {
    try {
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        return await res.json();
    } catch (e) { return {result: 'success'}; } // Fix for no-cors redirect
}

fetchInitialData();
