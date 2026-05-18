const userModel=require('../models/user.model')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs');
const generateToken = require('../utils/utils');
const signup=async (req,res)=>{
    const {fullName,email,password}=req.body;
   try {
       if(password.length<6){
        return res.status(400).json({message:"password must be at least 6 character"});
       }
       const existingUser=await userModel.findOne({
            email
       })
       if(existingUser){
        return res.status(400).json({message:"User already exists"})
       }
       const salt=await bcrypt.genSalt(10);
       const hashedPassword=await bcrypt.hash(password,salt)
       const user= await userModel.create({
        fullName,
        email,
        password:hashedPassword,

       })
       if(user){
            generateToken(user._id,res);
            await user.save();
            res.status(201).json({
                _id:user._id,
                fullName:user.fullName,
                email:user.email,
                profilePic:"user.profilePic"
            })
       }else{
            res.status(400).json({message:"Invalid user data"})
       }
      
   } catch (error) {
        console.log("Error in signed ")
        res.status(500).json({message:"internal server error"})
   }
}

const login=(req,res)=>{
    res.send("login")
}
const logout=(req,res)=>{
    res.send("Logout")
}

module.exports={
    signup,login,logout
}