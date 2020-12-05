const router = require("express").Router();
const controller = require("./controller");

router.post("/sign-in", controller.POST_signIn);
router.post("/sign-in/facebook", controller.POST_signInWithFB);
router.post("/sign-in/google", controller.POST_signInWithGG);

module.exports = router;
