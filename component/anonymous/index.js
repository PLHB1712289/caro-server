const router = require("express").Router();
const controller = require("./controller");

router.get("/", controller.GET_basic);

module.exports = router;
