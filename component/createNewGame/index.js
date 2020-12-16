const checkAuthorization = require("../../passport/checkAuthorization");

const router = require("express").Router();
const controller = require("./controller");

router.get("/:id", checkAuthorization(), controller.GET_getGame);
router.post("/newGame", checkAuthorization(), controller.POST_createNewGame);
router.post("/accessGame", checkAuthorization(), controller.POST_accessGame);
router.post("/message", checkAuthorization(), controller.POST_sendMessage);
router.get("/message", checkAuthorization(), controller.GET_getMessage);
router.post("/makeAMove", checkAuthorization(), controller.POST_makeAMove);

module.exports = router;
