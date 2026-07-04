import { Server } from 'socket.io';

export function initializeLogisticsSocket(httpServer, service) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket) => {
    socket.emit('state', service.getSnapshot());

    socket.on('subscribe', (channel) => {
      socket.join(channel);
    });
  });

  service.on('state:changed', (snapshot) => {
    io.emit('state', snapshot);
  });

  return io;
}
