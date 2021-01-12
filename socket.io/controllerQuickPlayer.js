// const createCallback = (TAG, callback) => ({ TAG, callback });

const ControllerQuickPlayer = class {
  constructor() {
    this.listPlayer = [];

    // (() => {
    //   setInterval(() => {
    //     console.log("LIST QUICK:", this.listPlayer);
    //   }, 5000);
    // })();
  }

  push(idPlayer) {
    for (let i = 0; i < this.listPlayer.length; i++) {
      if (this.listPlayer[i] === idPlayer) return;
    }

    this.listPlayer.push(idPlayer);
  }

  pop() {
    const player = this.listPlayer[0] || null;
    this.listPlayer = this.listPlayer.slice(1, this.listPlayer.length);
    return player;
  }

  remove(idPlayer) {
    this.listPlayer = this.listPlayer.filter((player) => {
      if (player !== idPlayer) return player;
      return null;
    });
  }

  getSize() {
    return this.listPlayer.length;
  }
};

const controllerQuickPlayer = new ControllerQuickPlayer();

module.exports = controllerQuickPlayer;
