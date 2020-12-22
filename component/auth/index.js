const router = require("express").Router();
const controller = require("./controller");

router.post("/sign-in", controller.POST_signIn);
router.post("/sign-in/facebook", controller.POST_signInWithFB);
router.post("/sign-in/google", controller.POST_signInWithGG);

router.post("/sign-up", controller.POST_signUp);

router.get("/active", controller.GET_active);

module.exports = router;
