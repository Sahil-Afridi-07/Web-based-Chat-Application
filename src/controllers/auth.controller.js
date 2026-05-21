const userModel=require('../models/user.model')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs');
const generateToken = require('../utils/utils');
const cloudinary=require('../utils/cloudinary')
const signup=async (req,res)=>{
    const {fullName,email,password}=req.body;
   try {
        if(!fullName||!email||!password){
            return res.status(400).json({message:"All fields are required"})
        }
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
                profilePic:user.profilePic
            })
       }else{
            res.status(400).json({message:"Invalid user data"})
       }
      
   } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).json({message:"internal server error"})
   }
}

const login=async (req,res)=>{
    const {email,password}=req.body
    try {
        const user=await userModel.findOne({email})
        if(!user){
            return res.status(400).json("Invalid credential");
        }

        const isPasswordMatched=await bcrypt.compare(password,user.password)
        if(!isPasswordMatched){
            return res.status(400).json("Invalid credential");
        }

        generateToken(user._id,res)
        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        })

    } catch (error) {
        console.log("Error in login Controller",error.message);
        return res.status(500).json({message:"Internal Server Error"})
    }
}
const logout=(req,res)=>{
    try {
        res.cookie("token","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("Error in logout Controller",error.message);
        return res.status(500).json({message:"Internal Server Error"})
    }
}
const updateProfile=async (req,res)=>{
    try {
        const {profilePic}=req.body;
        const userId=req.user._id;
        if(!profilePic){
            return res.status(400).json({message:"Profile pic is require"});
        }

        const uploadResponse= await cloudinary.uploader.upload(profilePic)
        const updateUser=await userModel.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
        res.status(200).json(updateUser)
    } catch (error) {
        console.log("Error in update-profile Controller",error.message);
        return res.status(500).json({message:"Internal Server Error"})
    }
}
const checkAuth=(req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in check auth: ",error.message)
        return res.status(500).json({message:"Unauthorized- No token Provided"})
    }
}

module.exports={
    signup,login,logout,updateProfile,checkAuth
}