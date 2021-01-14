const checkAuthorization = require("../../passport/checkAuthorization");

const router = require("express").Router();
const controller = require("./controller");

router.get("/message", controller.GET_getMessage);
// router.post("/message", checkAuthorization(), controller.POST_sendMessage);
router.get("/room", controller.GET_getRoom);
router.get(
  "/get-history-game",
  checkAuthorization(),
  controller.GET_historyGame
);
router.get(
  "/get-detail-history-game",
  checkAuthorization(),
  controller.GET_historyDetailGame
);

router.post("/new-room", checkAuthorization(), controller.POST_createNewRoom);

router.post("/newGame", checkAuthorization(), controller.POST_createNewGame);
router.post("/access", checkAuthorization(), controller.POST_accessGame);

router.get("/:id", controller.GET_getGame);
router.put("/:id", checkAuthorization(), controller.POST_makeAMove);
module.exports = router;
