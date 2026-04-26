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

## Step 2 Status

- Selesai: command bridge WebSocket -> gRPC (unary)
- Selesai: stream bridge gRPC -> WebSocket (auction + catalog)
- Selesai: server-initiated heartbeat event

## Kontrak Pesan WebSocket (Draft v1)

Semua command dari browser dikirim dalam bentuk JSON:

```json
{
	"type": "auction.place_bid",
	"requestId": "req-123",
	"payload": {
		"auction_id": "...",
		"bidder_name": "Alice",
		"amount": 600000000,
		"token": "..."
	}
}
```

### Command yang tersedia

- `auth.register`
- `auth.login`
- `catalog.get_items`
- `catalog.open_auction`
- `stream.catalog.start`
- `stream.catalog.stop`
- `auction.join`
- `auction.leave`
- `auction.place_bid`
- `auction.get_result`

### Event dari server

- `system.connected`
- `system.heartbeat`
- `catalog.event`
- `auction.update`
- `catalog.stream.ended`
- `auction.stream.ended`
- `command.error`

### Response sukses command

Server mengirim event result dengan pola `*.result`, misalnya:

- `auth.login.result`
- `catalog.get_items.result`
- `auction.place_bid.result`