import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Разрешаем CORS, если клиент на другом домене
  },
})
export class WsGateway {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  handleConnection(client: any) {
    const userEmail = client.handshake.query.email;
    if (userEmail) {
      this.userSockets.set(userEmail, client.id);
    }
  }

  handleDisconnect(client: any) {
    for (const [email, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(email);
        break;
      }
    }
  }

  sendNotification(userEmail: string, notification: any, data?: any) {
    const socketId = this.userSockets.get(userEmail);
    if (socketId) {
      this.server.to(socketId).emit(notification, data);
      console.log(notification + data)
    }
  }
}
