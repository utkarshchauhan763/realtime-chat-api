const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser  = async(req,res) => {
    try{
        const { name,email,password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create(
            {
            name,
            email,
            password: hashedPassword
            }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const loginUser = async(req,res) => {
    try{
        const{
            email,
            password
        } = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const  token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        res.status(200).json({
            success: true,
            message: "Login Successful",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                token
            }
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getCurrentUser = async(req,res,next) => {
    try{
        const user = await User.findById(req.user.userId)
            .select("-password");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        })
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};