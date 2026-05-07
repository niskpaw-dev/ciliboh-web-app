// =====================================================
// API LAYER - Komunikasi dengan Google Apps Script
// =====================================================

const API_URL = 'https://script.google.com/macros/s/AKfycbyy2SflnvVyajIcveKivKKu5B7KwJxShnKPbQMr6XJhwPZKCrBCSurciesFLraruVXhmQ/exec';

/**
 * Fetch initial data dari Sheet (products, customers, orders, stats)
 */
async function fetchInitialData() {
    try {
        showLoading(true);
        const res = await fetch(`${API_URL}?action=getInitialData`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        window.db = await res.json();
        renderUI();
    } catch (e) {
        console.error('fetchInitialData error:', e);
        showError("Gagal memuatkan data. Sila refresh halaman.");
    } finally {
        showLoading(false);
    }
}

/**
 * POST ke API. Hantar sebagai text/plain untuk elak CORS preflight di GAS.
 * Return result object yang sentiasa ada `result: 'success'|'error'`.
 */
async function apiPost(payload) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error('apiPost error:', e);
        return { result: 'error', error: e.message || 'Network error' };
    }
}

// ---------- UI Helpers ----------

function showLoading(show) {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.toggle('hidden', !show);
}

function showError(msg) {
    alert("⚠️  " + msg);
}

function showSuccess(msg) {
    alert("✓  " + msg);
}

// ---------- Auto-load ----------

document.addEventListener('DOMContentLoaded', fetchInitialData);
