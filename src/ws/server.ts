import { WebSocketServer, WebSocket } from 'ws';
import { env } from '../config/env';

export interface GatewayEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

function safeSend(client: WebSocket, event: GatewayEvent): void {
  if (client.readyState !== WebSocket.OPEN) return;
  client.send(JSON.stringify(event));
}

export function startWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ port: env.wsPort });

  wss.on('connection', (client) => {
    const welcomeEvent: GatewayEvent = {
      type: 'system.connected',
      payload: { message: 'Connected to BidStream WebSocket Gateway' },
      timestamp: Date.now(),
    };

    safeSend(client, welcomeEvent);

    client.on('message', (raw) => {
      // Step 1: echo-only parser to validate transport path.
      const inboundText = raw.toString();
      const ackEvent: GatewayEvent = {
        type: 'system.ack',
        payload: { received: inboundText },
        timestamp: Date.now(),
      };
      safeSend(client, ackEvent);
    });
  });

  return wss;
}
