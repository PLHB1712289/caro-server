const checkAuthorization=require("../../passport/checkAuthorization");

const router = require("express").Router();
const controller = require("./controller");

router.post("/newGame", checkAuthorization(), controller.POST_createNewGame);
router.post("/accessGame", checkAuthorization(), controller.POST_accessGame);

module.exports = router;
