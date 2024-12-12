const router = require("express").Router();
const { router: userRouter } = require("./users");

router.use("/users", userRouter);

module.exports = router;