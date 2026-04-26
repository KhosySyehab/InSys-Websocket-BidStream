# Pembagian Job 2 Orang (Berurutan)

Dokumen ini dibuat untuk skema kerja **berurutan**:
- **Orang 1 (kamu)** mengerjakan fondasi utama dulu.
- Setelah milestone Orang 1 selesai, **Orang 2** melanjutkan bagian pelengkap.

---

## Aturan Eksekusi (Wajib)

1. Orang 2 **tidak mulai coding utama** sebelum Milestone A dan B milik Orang 1 selesai.
2. Semua kontrak event WebSocket (nama event + payload) difinalkan oleh Orang 1.
3. Orang 2 hanya membangun fitur di atas kontrak yang sudah freeze.
4. Jika Orang 1 mengubah kontrak setelah freeze, Orang 1 wajib update changelog + kompatibilitas.

---

## Orang 1 - Fondasi Sistem End-to-End

Peran: **Backend Lead + Integrasi Arsitektur**

### Scope Utama

1. Setup arsitektur proyek WebSocket bridge.
2. Implementasi WebSocket Gateway (server).
3. Integrasi gRPC stream -> WebSocket event.
4. Integrasi command WebSocket -> pemanggilan gRPC.
5. Standarisasi message contract (request/response/event).
6. Error handling dan reconnect handling dasar.
7. Menyediakan endpoint/flow siap dipakai UI.

### Deliverables Wajib Orang 1

1. Folder gateway backend siap jalan.
2. Dokumen kontrak event-command final (freeze v1).
3. Demo CLI/log bahwa stream gRPC sukses diteruskan ke WebSocket.
4. Minimal 3 server-initiated events aktif (contoh: `BID_UPDATE`, `AUCTION_CLOSING`, `AUCTION_CLOSED`).
5. Command bridge aktif (contoh: `place_bid`, `open_auction`, `join_auction`).

### Milestone Orang 1

- **Milestone A :**
	- Struktur proyek + server WebSocket hidup.
	- Koneksi ke service gRPC sukses.

- **Milestone B :**
	- Stream gRPC -> WebSocket event berjalan stabil.
	- Command dari WebSocket -> gRPC berhasil.
	- Kontrak payload **freeze v1**.

- **Milestone C :**
	- Error handling dasar + validasi command.
	- Handover ke Orang 2 dengan dokumentasi singkat.

### Checklist Selesai Orang 1

- [ ] WebSocket gateway jalan stabil.
- [ ] Streaming data otomatis ke klien tanpa polling.
- [ ] Command dari browser memicu fungsi gRPC yang benar.
- [ ] Kontrak event/command dibekukan (v1) dan didokumentasikan.
- [ ] Orang 2 bisa lanjut tanpa menunggu perubahan backend mayor.

---

## Orang 2 - UI Event-Driven + Finalisasi Demo

Peran: **Frontend Lead + Packaging Presentasi**

### Prasyarat Mulai (Harus Terpenuhi)

Orang 2 baru mulai setelah:
1. Milestone A dan B Orang 1 selesai.
2. Kontrak event-command status **freeze v1**.
3. Tersedia contoh payload untuk testing UI.

### Scope Utama

1. Bangun Web UI terhubung ke WebSocket gateway.
2. Implement minimal 3 komponen dinamis (event-driven):
	 - Status auction (OPEN/CLOSING/CLOSED)
	 - Live bid panel (harga tertinggi + bidder)
	 - Activity log real-time
3. Buat command panel di UI untuk kirim instruksi.
4. Integrasi feedback sukses/gagal command di UI.
5. Finalisasi materi demo (alur fitur + screenshot/video capture plan).

### Deliverables Wajib Orang 2

1. UI menampilkan update real-time dari WebSocket.
2. Tiga komponen dinamis berjalan bersamaan.
3. Browser bisa kirim command ke backend via WebSocket.
4. Script demo 5-7 menit (siap direkam untuk video 15 menit).

### Milestone Orang 2

- **Milestone D :**
	- UI connect WebSocket + render event dasar.

- **Milestone E :**
	- 3 komponen dinamis lengkap + command panel aktif.
	- Final rehearsal demo.

### Checklist Selesai Orang 2

- [ ] UI menerima server-initiated events tanpa refresh.
- [ ] Tiga komponen dinamis terbukti berubah saat event masuk.
- [ ] Command & Control bridge berjalan dari browser.
- [ ] Bahan presentasi dan demo siap.

---

## File Ownership (Agar Tidak Tabrakan)

### Milik Orang 1

- Seluruh folder backend gateway WebSocket.
- Konfigurasi koneksi gRPC/WebSocket.
- Dokumen kontrak event-command.

### Milik Orang 2

- Seluruh folder frontend Web UI.
- Styling, komponen dinamis, dan interaksi command panel.
- Script/demo notes presentasi.

### File Bersama (Review Berdua)

- `README.md`
- Dokumen arsitektur
- Video/script presentasi

---

## Mekanisme Serah Terima Orang 1 -> Orang 2

1. Orang 1 kirim ringkasan 1 halaman:
	 - daftar event
	 - daftar command
	 - contoh payload sukses/gagal
2. Orang 1 rekam demo singkat (1-2 menit) alur event masuk dan command diproses.
3. Orang 2 mulai implement UI berdasarkan dokumen tersebut tanpa menunggu sinkron tambahan.

---

## Definisi Done Proyek

Proyek dianggap selesai jika seluruh poin berikut terpenuhi:

1. Streaming gRPC terhubung ke WebSocket dan tampil otomatis di UI.
2. Minimal 3 komponen UI berubah dinamis oleh event WebSocket.
3. Ada server-initiated events yang tampil di browser tanpa request klien.
4. Browser dapat mengirim command via WebSocket dan memicu fungsi gRPC backend.
5. Source code + video presentasi siap dikumpulkan dalam format zip.