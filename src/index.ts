import { checkGrpcConnectivity, closeGrpcClients } from './grpc/clients';
import { startWebSocketServer } from './ws/server';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await checkGrpcConnectivity();
  console.log('[bootstrap] gRPC connectivity check passed (Auth/Catalog/Bidding)');

  const wss = startWebSocketServer();
  console.log(`[bootstrap] WebSocket gateway listening on ws://localhost:${env.wsPort}`);

  process.on('SIGINT', () => {
    console.log('\n[shutdown] Received SIGINT, closing services...');
    wss.close();
    closeGrpcClients();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[shutdown] Received SIGTERM, closing services...');
    wss.close();
    closeGrpcClients();
    process.exit(0);
  });
}

bootstrap().catch((err: Error) => {
  console.error('[bootstrap] Failed to start gateway:', err.message);
  closeGrpcClients();
  process.exit(1);
});
