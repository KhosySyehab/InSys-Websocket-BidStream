# InSys-Websocket-BidStream

WebSocket gateway untuk menjembatani browser (frontend) dengan layanan gRPC pada project sebelumnya.

## Step 1 Status

- Selesai: fondasi backend gateway.
- Selesai: WebSocket server hidup di port `8080` (default).
- Selesai: startup check koneksi ke 3 service gRPC (`Auth`, `Catalog`, `Bidding`).

## Prasyarat

1. Jalankan service gRPC dari repo `InSys-gRPC-BidStream`:
	- `npm run auth`
	- `npm run catalog`
	- `npm run bidding`
2. Gunakan Node.js 18+.

## Menjalankan Gateway

1. Install dependency:

```bash
npm install
```

2. Salin environment file:

```bash
cp .env.example .env
```

3. Jalankan mode development:

```bash
npm run dev
```

Jika sukses, log akan menampilkan:

- `gRPC connectivity check passed (Auth/Catalog/Bidding)`
- `WebSocket gateway listening on ws://localhost:8080`