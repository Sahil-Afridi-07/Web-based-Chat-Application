const jwt=require('jsonwebtoken');
const userModel=require('../models/user.model')

async function authMiddleware(req,res,next){
    try {
        const token=req.cookies.token
        if(!token){
            return res.status(401).json({message:"Unauthorized access, please Login"});
        }
        const decode=jwt.verify(token,process.env.JWT_SECRET)
        if(!decode){
            return res.status(401).json({message:"Unauthozied- Invalid Token"})
        }
       const user = await userModel.findById(decode.userId).select("-password")
        req.user=user
        next()

    } catch (error) {
        console.log("Error in authMiddleware: ",error.message)
        return res.status(500).json({message:"Internal Server error"})
    }
}
module.exports=authMiddleware
