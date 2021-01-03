const ControllerSocket = class {
  constructor() {
    this.listSocket = [];

    // (() => {
    //   setInterval(() => {
    //     console.log("[LIST_SOCKET]:", this.listSocket);
    //   }, 3000);
    // })();
  }

  push(socket) {
    this.listSocket.push({ socket: socket, listener: [] });
  }

  get(socketID) {
    for (let i = 0; i < this.listSocket.length; i++) {
      if (this.listSocket[i].socket.id === socketID)
        return this.listSocket[i].socket;
    }

    console.log("RUN FAIL");
    return null;
  }

  setListener(socketID, TAG, callback) {
    for (let i = 0; i < this.listSocket.length; i++) {
      const { socket, listener } = this.listSocket[i];

      if (socket.id === socketID) {
        for (let j = 0; j < listener.length; j++) {
          if (listener[j].TAG === TAG) return;
        }

        this.listSocket[i].listener = listener.concat({
          TAG,
          callback: callback,
        });
        this.listSocket[i].socket.on(TAG, callback);

        return;
      }
    }
  }

  removeListener(socketID, TAG) {
    for (let i = 0; i < this.listSocket.length; i++) {
      const { socket, listener } = this.listSocket[i];

      if (socket.id === socketID) {
        for (let j = 0; j < listener.length; j++) {
          if (listener[j].TAG === TAG) {
            const callback = listener[j].callback;

            this.listSocket[i].socket.off(TAG, callback);
            this.listSocket[i].listener = listener.filter((item) => {
              if (item.TAG !== TAG) return item;
              return null;
            });

            return;
          }
        }

        return;
      }
    }
  }

  remove(socketID) {
    this.listSocket = this.listSocket.filter((socket) => {
      if (socket.socket.id !== socketID) {
        return socket;
      }

      return null;
    });
  }
};

const controllerSocket = new ControllerSocket();

module.exports = controllerSocket;
