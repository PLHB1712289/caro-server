const checkAuthorization = require("../../passport/checkAuthorization");

const router = require("express").Router();
const controller = require("./controller");

router.post("/new-room", checkAuthorization(), controller.POST_createNewRoom);
router.get("/room", checkAuthorization(), controller.POST_getRoom);

router.get("/:id", checkAuthorization(), controller.GET_getGame);
router.put("/:id", checkAuthorization(), controller.POST_makeAMove);
router.post("/newGame", checkAuthorization(), controller.POST_createNewGame);
router.post("/access", checkAuthorization(), controller.POST_accessGame);
router.get("/message", checkAuthorization(), controller.GET_getMessage);
router.post("/message", checkAuthorization(), controller.POST_sendMessage);

module.exports = router;
