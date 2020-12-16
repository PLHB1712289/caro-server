const router = require("express").Router();
const controller = require("./controller");

router.post("/newBoard", controller.POST_createNewGame);

module.exports = router;
