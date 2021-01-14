const {
  moveModel,
  roomModel,
  userModel,
  messageModel,
  gameModel,
} = require("./schema");

const NUMBER_USER = 20;
const NUMBER_ROOM = 10;
const NUMBER_GAME = 10;
const NUMBER_MOVE = 10;
const NUMBER_MESSAGE = 10;

const size = 20;

(async () => {
  for (let numberUser = 0; numberUser < NUMBER_USER; numberUser += 2) {
    const player1 = await new userModel({
      username: `PlayerExample${numberUser}`,
      email: `player${numberUser}@mail.com`,
      fullname: `player${numberUser}`,
    }).save();

    const player2 = await new userModel({
      username: `PlayerExample${numberUser + 1}`,
      email: `player${numberUser + 1}@mail.com`,
      fullname: `player${numberUser + 1}`,
    }).save();

    for (let numberRoom = 0; numberRoom < NUMBER_ROOM; numberRoom++) {
      const newRoom = await new roomModel({
        player1: player1.id,
        player2: player2.id,
        isOpen: false,
      }).save();

      for (let numberGame = 0; numberGame < NUMBER_GAME; numberGame++) {
        player1.totalGame = player1.totalGame + 1;
        player1.totalGameWin =
          player1.totalGame + (numberGame % 2) !== 0 ? 1 : 0;
        player1.totalGameLose =
          player1.totalGame + player1.totalGame + (numberGame % 2) !== 0
            ? 0
            : 1;

        player2.totalGame = player2.totalGame + 1;
        player2.totalGameWin =
          player2.totalGame + (numberGame % 2) !== 0 ? 0 : 1;
        player2.totalGameLose =
          player2.totalGame + player2.totalGame + (numberGame % 2) !== 0
            ? 1
            : 0;

        player1.cup =
          player1.cup + player1.totalGameWin * 2 - player1.totalGameLose;

        player2.cup =
          player2.cup + player2.totalGameWin * 2 - player2.totalGameLose;

        player1.save();
        player2.save();

        const newGame = await new gameModel({
          idRoom: newRoom.id,
          player1: player1.id,
          player2: player2.id,
          status: false,
          winner: numberGame % 2 !== 0 ? player1.id : player2.id,
          playerX: numberGame % 2 !== 0 ? player1.id : player2.id,
        }).save();

        const board = new Array(size * size).fill(null);

        for (let numberMove = 0; numberMove < NUMBER_MOVE; numberMove++) {
          board[numberMove] = numberMove % 2 !== 0 ? "X" : "O";

          await new moveModel({
            idRoom: newRoom.id,
            idGame: newGame._id,
            order: numberMove,
            index: numberMove,
            numberMove,
            board,
          }).save();
        }

        for (
          let numberMessage = 0;
          numberMessage < NUMBER_MESSAGE;
          numberMessage++
        ) {
          await new messageModel({
            idRoom: newRoom.id,
            idGame: newGame._id,
            idUser: numberMessage % 2 !== 0 ? player1.id : player2.id,
            message: `Mess ${numberMessage}`,
          }).save();
        }
      }
    }
  }
})();

module.exports = {};
