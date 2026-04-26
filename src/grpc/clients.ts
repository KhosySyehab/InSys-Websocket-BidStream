import fs from 'fs';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { env } from '../config/env';

type AnyClient = grpc.Client;

function loadProto(fileName: string): any {
  const protoPath = path.join(env.grpcProtoDir, fileName);
  if (!fs.existsSync(protoPath)) {
    throw new Error(`Proto file not found: ${protoPath}`);
  }

  const packageDef = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  return grpc.loadPackageDefinition(packageDef);
}

const authProto = loadProto('auth.proto') as any;
const catalogProto = loadProto('catalog.proto') as any;
const biddingProto = loadProto('bidding.proto') as any;

export const authClient = new authProto.auth.AuthService(
  env.grpcAuthHost,
  grpc.credentials.createInsecure()
) as AnyClient;

export const catalogClient = new catalogProto.catalog.CatalogService(
  env.grpcCatalogHost,
  grpc.credentials.createInsecure()
) as AnyClient;

export const biddingClient = new biddingProto.bidding.BiddingService(
  env.grpcBiddingHost,
  grpc.credentials.createInsecure()
) as AnyClient;

function waitReady(client: AnyClient, label: string): Promise<void> {
  const deadline = Date.now() + 3000;
  return new Promise((resolve, reject) => {
    client.waitForReady(deadline, (err) => {
      if (err) {
        reject(new Error(`${label} is not ready: ${err.message}`));
        return;
      }
      resolve();
    });
  });
}

export async function checkGrpcConnectivity(): Promise<void> {
  await waitReady(authClient, 'AuthService');
  await waitReady(catalogClient, 'CatalogService');
  await waitReady(biddingClient, 'BiddingService');
}

export function closeGrpcClients(): void {
  authClient.close();
  catalogClient.close();
  biddingClient.close();
}
