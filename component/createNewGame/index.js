const checkAuthorization = require("../../passport/checkAuthorization");

const router = require("express").Router();
const controller = require("./controller");

router.post("/newGame", checkAuthorization(), controller.POST_createNewGame);
router.post("/accessGame", checkAuthorization(), controller.POST_accessGame);
router.post("/message", checkAuthorization(), controller.POST_sendMessage);
router.get("/message", checkAuthorization(), controller.GET_getMessage);

module.exports = router;
