CiliBoh™ - Smart Factory Ordering System
An Integrated SME Management Solution for Chili Paste Producers
![alt text](https://img.shields.io/badge/Version-1.0.0-red)

![alt text](https://img.shields.io/badge/License-MIT-blue)

![alt text](https://img.shields.io/badge/Platform-Web--App-orange)

📌 Projek Overview
CiliBoh System adalah sistem pengurusan pesanan (Ordering System) berasaskan web yang direka khusus untuk pengilang IKS. Sistem ini memudahkan proses pesanan B2B, pemantauan stok, pengurusan hutang (credit terms), dan laporan keuntungan dalam satu paparan skrin tunggal (Single Screen Viewport).
Dibina dengan estetika Neumorphism, sistem ini memberikan pengalaman UI/UX yang moden, bersih, dan interaktif.

✨ Ciri-Ciri Utama
🛒 Smart Ordering: Sistem harga automatik mengikut kategori pelanggan (Retail vs Kilang).
💸 Financial Tracking: Menyokong bayaran deposit (Partial Payment) dan pemantauan baki hutang secara real-time.
🚚 Delivery Management: Status penghantaran dari Pending sehingga Completed.
🔄 Smart Return Logic: Fungsi pulangan barang rosak yang mengurangkan baki hutang dan mengemaskini laporan secara automatik.
📊 Dynamic Dashboard: Laporan jualan, perbelanjaan (Expenses), dan untung bersih (Hari ini, Minggu ini, Bulan ini).
📱 Mobile Optimized: Rekabentuk 9:16 yang sempurna untuk kegunaan telefon pintar pengurus kilang.

🛠️ Tech Stack
Frontend: HTML5, CSS3 (Custom Neumorphism), Tailwind CSS, JavaScript (ES6+).
Backend: Google Apps Script (REST API).
Database: Google Sheets (Cloud-based).
Hosting: GitHub Pages.
Automation: WhatsApp Deep Linking.

🏗️ Arsitektur Sistem
Frontend (GitHub Pages): Bertindak sebagai antaramuka pengguna untuk memasukkan data dan melihat laporan.
API Layer (Apps Script): Menghubungkan Frontend dengan Database melalui protokol JSON.
Database (Google Sheets): Menyimpan data transaksi, profil pelanggan, dan log perbelanjaan.

📂 Struktur Fail
code
Text
├── index.html       # Struktur utama dan sistem Viewport
├── css/
│   └── style.css    # Design Neumorphism dan animasi UI
├── js/
│   ├── api.js       # Logik komunikasi Fetch API & Endpoint
│   ├── ui.js        # Pengurusan state paparan dan navigasi
│   └── app.js       # Logik bisnes (Pengiraan harga, Return & Submit)
└── README.md        # Dokumentasi projek

🚀 Cara Setup (Quick Start)
Clone Repository:
code
Bash
git clone https://github.com/username/ciliboh-system.git
Database Setup:
Cipta Google Sheets mengikut skema yang ditetapkan.
Deploy kod Apps Script di menu Extensions > Apps Script.
Set akses kepada Anyone.
Configuration:
Masukkan URL Web App anda ke dalam fail js/api.js.
Deploy:
Aktifkan GitHub Pages di tab Settings repository anda.

📸 Paparan Skrin (UI Preview)
[Masukkan imej/screenshot app anda di sini]
Gaya Neumorphism dengan butang "Embossed" dan palet warna kelabu lembut (#E0E5EC).

🤝 Hubungi
Jika anda mempunyai sebarang soalan atau cadangan, sila hubungi saya:
Developer: Niskala Pawaka
Email: madib.wasit@gmail.com
