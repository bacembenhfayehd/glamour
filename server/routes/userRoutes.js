import express from "express";
import authenticate from "../middleware/auth.js";
import userController from "../controllers/user-controller.js";


const router = express.Router();
router.use(authenticate);

router.post("/comment",userController.addComment);
router.get('/profile',  userController.getProfile);
router.put('/', userController.updateProfile);
router.put('/password', userController.updatePassword);

export default router;
