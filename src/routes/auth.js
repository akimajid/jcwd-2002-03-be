const router = require("express").Router()
const controllers = require("../middlewares/controllers")
const { authorizedToken } = require("../middlewares/authMiddleware")
const { registerValidation, validator, adminValidation } = require("../middlewares/validator/validator")
const authService = require("../services/auth/index.js")

router.post("/register", registerValidation, validator, controllers(authService.register))
router.get("/verify/:token", controllers(authService.verifyEmail))


router.post("/admin/register", registerValidation, validator, controllers(authService.adminRegister))
router.post("/admin/login", adminValidation, validator, controllers(authService.adminLogin))
router.post("/signin", controllers(authService.login))
router.get("/refresh-token", authorizedToken, controllers(authService.keepLogin))
router.post("/forgot-password-email", controllers(authService.forgotPassword))
router.patch("/change-password/:token", controllers(authService.changePassword))

module.exports = router