const router = require("express").Router();
const controller = require("./controller");
const checkAuthorization = require("../../passport/checkAuthorization");

router.post("/sign-in", controller.POST_signIn);
router.post("/sign-in/facebook", controller.POST_signInWithFB);
router.post("/sign-in/google", controller.POST_signInWithGG);

router.post("/sign-up", controller.POST_signUp);

router.get("/active", controller.GET_active);
router.post("/get-user-by-id", controller.GET_user_by_id);
router.get("/listUserRank", controller.GET_list_user_rank);


router.get("/profile",checkAuthorization(), controller.GET_user);
router.post("/update",checkAuthorization(), controller.POST_updateUser);

router.post("/change-password",checkAuthorization(),controller.POST_changePassword);
router.post("/forgot-password",controller.POST_forgotPassword);
module.exports = router;
