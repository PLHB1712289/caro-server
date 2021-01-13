const {
  gameModel,
  userModel,
  moveModel,
  roomModel,
} = require("../database/schema");
const controllerSocket = require("./controllerSocket");
const controllerUser = require("./controllerUser");
const SOCKET_TAG = require("./data");

const size = 20;
const LIMIT_TIME = 10;
const STATUS_ROOM = {
  WAITING: "waiting",
  READY: "ready",
  PLAYING: "playing",
};

const ControllerGame = class {
  constructor(io, idRoom, idPlayer1, idPlayer2) {
    this.io = io;
    this.idRoom = idRoom;
    this.idPlayer1 = idPlayer1;
    this.idPlayer2 = idPlayer2;
    this.idGame = null;

    this.playerX = null;
    this.playerO = null;

    this.socketPlayer1 = controllerSocket.get(
      controllerUser.getSocketID(idPlayer1)
    );
    this.socketPlayer2 = controllerSocket.get(
      controllerUser.getSocketID(idPlayer2)
    );

    this.board = new Array(size * size).fill(null);
    this.orderTurn = 0;

    this.timmerInterval = null;
    this.updateTimeInterval = null;
    this.time = LIMIT_TIME;
    this.limitTime = LIMIT_TIME;
  }

  async handleMove(index) {
    clearInterval(this.timmerInterval);
    clearInterval(this.updateTimeInterval);

    this.timmerInterval = null;
    this.updateTimmerInterval = null;

    this.board[index] = this.orderTurn % 2 === 0 ? "X" : "O";

    this.io.to(this.idRoom).emit(SOCKET_TAG.RESPONSE_MOVE, {
      board: this.board,
      index,
      order: this.order,
    });

    new moveModel({
      idRoom: this.idRoom,
      idGame: this.idGame,
      board: this.board,
      order: this.orderTurn,
      index,
    }).save();

    if (this.checkDraw().gameover === true) {
      this.stopGame();
      return;
    }

    const { gameover, winner } = this.checkWin(index);

    if (gameover) {
      this.io.to(this.idRoom).emit(SOCKET_TAG.RESPONSE_WINNER, { winner });
      this.stopGame();

      const player1 = await userModel.findOne({ id: this.idPlayer1 });
      const player2 = await userModel.findOne({ id: this.idPlayer2 });

      if (winner === this.player1) {
        player1.totalGameWin = player1.totalGameWin + 1;
        player2.totalGameLose = player2.totalGameLose + 1;

        player1.cup = player1.cup + 2;
        player2.cup = player2.cup - 1 < 0 ? 0 : player2.cup - 1;
      } else {
        player1.totalGameLose = player1.totalGameLose + 1;
        player2.totalGameWin = player2.totalGameWin + 1;

        player2.cup = player2.cup + 2;
        player1.cup = player1.cup - 1 < 0 ? 0 : player1.cup - 1;
      }

      player1.save();
      player2.save();
      return;
    }

    this.orderTurn++;
    this.time = this.limitTime;

    const playerNextTurn =
      this.orderTurn % 2 === 0 ? this.playerX : this.playerO;

    this.io
      .to(this.idRoom)
      .emit(SOCKET_TAG.RESPONSE_TIMMER, { time: this.limitTime });

    this.io
      .to(this.idRoom)
      .emit(SOCKET_TAG.RESPONSE_PLAYER_NEXT_TURN, { player: playerNextTurn });

    this.timmerInterval = setInterval(
      () => this.timeUp(),
      this.limitTime * 1000
    );
    this.updateTimeInterval = setInterval(() => this.updateTimmer(), 1000);
  }

  async startGame() {
    this.io.emit(SOCKET_TAG.RESPONSE_UPDATE_STATUS_ROOM, {
      room: { id: this.idRoom, status: STATUS_ROOM.PLAYING },
    });

    this.board = Array(size * size).fill(null);
    this.time = LIMIT_TIME;
    const newGame = new gameModel({
      idRoom: this.idRoom,
      player1: this.idPlayer1,
      player2: this.idPlayer2,
    });

    this.idGame = newGame._id;
    this.orderTurn = 0;
    const roomDB = await roomModel.findOne({ idRoom: this.idRoom });
    roomDB.gameCurrent = this.idGame;
    roomDB.save();
    this.time = roomDB.limitTime;
    this.limitTime = roomDB.limitTime;

    const oldGame = await gameModel
      .find({ idRoom: this.idRoom, status: false })
      .sort({ created_at: -1 })
      .select("winner");

    if (oldGame.length === 0) {
      this.playerX = this.idPlayer1;
      this.playerO = this.idPlayer2;
    } else if (oldGame[0].winner === this.idPlayer1) {
      this.playerX = this.idPlayer1;
      this.playerO = this.idPlayer2;
    } else {
      this.playerX = this.idPlayer2;
      this.playerO = this.idPlayer1;
    }

    newGame.playerX = this.playerX;
    newGame.save();

    // response user who is the playerX and gameID current
    this.io.to(this.idRoom).emit(SOCKET_TAG.RESPONSE_INFO_PLAYER_XO, {
      playerX: this.playerX,
      playerO: this.playerO,
      gameID: this.idGame,
    });

    this.io
      .to(this.idRoom)
      .emit(SOCKET_TAG.RESPONSE_TIMMER, { time: this.limitTime });
    this.timmerInterval = setInterval(
      () => this.timeUp(),
      this.limitTime * 1000
    );
    this.updateTimeInterval = setInterval(() => this.updateTimmer(), 1000);

    controllerSocket.setListener(
      controllerUser.getSocketID(this.idPlayer1),
      SOCKET_TAG.REQUEST_MOVE,
      ({ index }) => this.handleMove(index)
    );

    controllerSocket.setListener(
      controllerUser.getSocketID(this.idPlayer2),
      SOCKET_TAG.REQUEST_MOVE,
      ({ index }) => this.handleMove(index)
    );

    const player1 = await userModel.findOne({ id: this.idPlayer1 });
    const player2 = await userModel.findOne({ id: this.idPlayer2 });

    player1.totalGame = player1.totalGame + 1;
    player2.totalGame = player2.totalGame + 1;

    player1.save();
    player2.save();

    return newGame._id;
  }

  async stopGame() {
    console.log("REMOVE LISTENER");

    const game = await gameModel.findOne({ _id: this.idGame });
    game.status = false;
    game.save();

    const roomDB = await roomModel.findOne({ idRoom: this.idRoom });
    roomDB.gameCurrent = null;
    roomDB.save();

    controllerSocket.removeListener(
      controllerUser.getSocketID(this.idPlayer1),
      SOCKET_TAG.REQUEST_MOVE
    );
    controllerSocket.removeListener(
      controllerUser.getSocketID(this.idPlayer2),
      SOCKET_TAG.REQUEST_MOVE
    );

    this.io.emit(SOCKET_TAG.RESPONSE_UPDATE_STATUS_ROOM, {
      room: { id: this.idRoom, status: STATUS_ROOM.READY },
    });

    this.idGame = null;
  }

  reConnect(socketID) {
    console.log("RECONNECT");
    this.io.to(socketID).emit(SOCKET_TAG.RESPONSE_RECONNECT, {
      board: this.board,
      playerX: this.playerX,
      currentPlayer: this.orderTurn % 2 !== 0 ? this.playerO : this.playerX,
    });

    const userID = controllerUser.getUserID(socketID);
    if (userID === this.idPlayer1 || userID === this.idPlayer2) {
      controllerSocket.setListener(
        socketID,
        SOCKET_TAG.REQUEST_MOVE,
        ({ index }) => this.handleMove(index)
      );
    }

    this.io
      .to(this.socketPlayer1)
      .to(this.socketPlayer1)
      .emit(SOCKET_TAG.RESPONSE_UPDATE_STATUS_ROOM_FOR_PLAYER, {
        room: { status: STATUS_ROOM.PLAYING },
      });
  }

  checkDraw() {
    // <CheckDraw>
    let countCellNullInBoard = size * size;

    this.board.forEach((cell) => {
      countCellNullInBoard -= cell ? 1 : 0;
    });

    if (countCellNullInBoard === 0) {
      return { gameover: true };
    }

    return { gameover: false };
    // </CheckDraw>
  }

  checkWin(index) {
    console.log("CHECK WIN");
    let gameover = false;
    let winner = null;

    //Ngang - Doc - Cheo Chinh - Cheo phu
    const dx = [-1, 1, 0, 0, -1, 1, 1, -1];
    const dy = [0, 0, -1, 1, -1, 1, -1, 1];

    const maxX = size - 1;
    const maxY = size - 1;

    let count = 1;

    for (let k = 0; k < dx.length; k++) {
      let currX = index % size; //colums
      let currY = ~~(index / size); //rows

      //update count
      if (k % 2 === 0) {
        count = 1;
      }

      while (true) {
        currX += dx[k];
        currY += dy[k];

        if (currX < 0 || currX > maxX || currY < 0 || currY > maxY) {
          break;
        } else {
          if (this.board[currY * size + currX] === this.board[index]) {
            count++;
            if (count === 5) {
              break;
            }
          } else {
            break;
          }
        }
      }

      if (count === 5) {
        winner = this.orderTurn % 2 === 0 ? this.playerX : this.playerO;
        gameover = true;
        break;
      }
    }

    return { gameover, winner };
  }

  async timeUp() {
    if (this.timmerInterval && this.updateTimeInterval) {
      const winner = this.orderTurn % 2 !== 0 ? this.playerX : this.playerO;

      this.io.to(this.idRoom).emit(SOCKET_TAG.RESPONSE_TIME_UP, {
        winner,
      });

      clearInterval(this.timmerInterval);
      clearInterval(this.updateTimeInterval);
      this.timmerInterval = null;
      this.updateTimeInterval = null;

      const game = await gameModel.findOne({ _id: this.idGame });
      game.winner = winner;
      game.save();

      const player1 = await userModel.findOne({ id: this.idPlayer1 });
      const player2 = await userModel.findOne({ id: this.idPlayer2 });

      if (winner === this.player1) {
        player1.totalGameWin = player1.totalGameWin + 1;
        player2.totalGameLose = player2.totalGameLose + 1;

        player1.cup = player1.cup + 2;
        player2.cup = player2.cup - 1 < 0 ? 0 : player2.cup - 1;
      } else {
        player1.totalGameLose = player1.totalGameLose + 1;
        player2.totalGameWin = player2.totalGameWin + 1;

        player2.cup = player2.cup + 2;
        player1.cup = player1.cup - 1 < 0 ? 0 : player1.cup - 1;
      }

      player1.save();
      player2.save();
    }

    this.stopGame();
  }

  updateTimmer() {
    if (this.timmerInterval && this.updateTimeInterval) {
      this.time -= 1;
      this.io
        .to(this.idRoom)
        .emit(SOCKET_TAG.RESPONSE_TIMMER, { time: this.time });
    }
  }

  async move() {}
};

module.exports = ControllerGame;
