const logger = require("../../../common/logger/winston");

module.exports = (io, socket) => {
  const userId = socket.user.id || socket.user._id;

  // Handle manual topic subscriptions
  socket.on("notification:subscribe", (roomName) => {
    if (roomName) {
      socket.join(roomName);
      logger.info(`Socket ${socket.id} subscribed to room: ${roomName}`);
    }
  });

  // Handle manual topic unsubscribes
  socket.on("notification:unsubscribe", (roomName) => {
    if (roomName) {
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} unsubscribed from room: ${roomName}`);
    }
  });
};
