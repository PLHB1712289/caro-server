const router = require("express").Router();
const controller = require("./controller");

router.post("/sign-in", controller.POST_signIn);
router.post("/sign-in/facebook", controller.POST_signInWithFB);
router.post("/sign-in/google", controller.POST_signInWithGG);
router.get("/user-online", controller.GET_userOnline);

router.post("/sign-up", controller.POST_signUp);

module.exports = router;
