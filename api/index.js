const router = require("express").Router();
const { router: userRouter } = require("./users");

router.use("/users", userRouter);
//router.use("/items", require("./items"));


module.exports = router;