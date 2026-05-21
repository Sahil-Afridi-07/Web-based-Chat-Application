const express=require('express');
const {signup,login,logout,updateProfile,checkAuth}=require('../controllers/auth.controller');
const authMiddleware=require('../middleware/auth.middleware')
const router=express.Router();
const multer=require('multer')

const upload=multer({storage:multer.memoryStorage()})

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout);
router.put("/update-profile",authMiddleware,updateProfile)
router.get("/check",authMiddleware,upload.single("image"),checkAuth)
module.exports=router;