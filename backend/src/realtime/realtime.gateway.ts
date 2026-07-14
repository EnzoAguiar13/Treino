import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Canal em tempo real: qualquer mutação relevante emite um evento
 * (`affiliate.updated`, `dashboard.updated`, `notification.created`…)
 * e os clientes invalidam suas queries automaticamente.
 */
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:3000'] },
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    client.emit('connected', { ok: true });
  }

  emit(event: string, payload: unknown = {}) {
    this.server?.emit(event, payload);
  }
}
