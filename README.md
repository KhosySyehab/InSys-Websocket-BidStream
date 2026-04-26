# InSys-Websocket-BidStream

WebSocket gateway untuk menjembatani browser (frontend) dengan layanan gRPC BidStream.

Repo ini sekarang sudah standalone (tidak bergantung ke repo lain), karena source backend gRPC sudah disertakan di folder `grpc-backend`.

## Step 1 Status

- Selesai: fondasi backend gateway.
- Selesai: WebSocket server hidup di port `8080` (default).
- Selesai: startup check koneksi ke 3 service gRPC (`Auth`, `Catalog`, `Bidding`).

## Struktur Utama

- `grpc-backend/`: backend gRPC (Auth, Catalog, Bidding)
- `src/`: WebSocket Gateway

## Prasyarat

1. Gunakan Node.js 18+.

## Menjalankan Gateway

1. Setup semua dependency (root + grpc-backend):

```bash
npm run setup
```

2. Salin environment file:

```bash
cp .env.example .env
```

3. Jalankan seluruh stack (3 service gRPC + gateway) dari repo ini:

```bash
npm run dev:stack
```

Atau jalankan gateway saja:

```bash
npm run dev
```

Jika sukses, log akan menampilkan:

- `gRPC connectivity check passed (Auth/Catalog/Bidding)`
- `WebSocket gateway listening on ws://localhost:8080`