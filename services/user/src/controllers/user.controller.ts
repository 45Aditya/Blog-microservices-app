import User from "../model/User.model.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.middleware.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from 'cloudinary'

export const loginUser = TryCatch(async(req, res) => {
    const {email, name, image} = req.body;
    let user = await User.findOne({email})

    if(!user) {
        user = await User.create({
            name, 
            email,
            image
        })
    }

    const token = jwt.sign({user}, process.env.JWT_SECRET as string, {
        expiresIn: "5d"
    })

    res.status(200).json({
        message: "Login Success",
        token,
        user
    })
})

export const myProfile = TryCatch(async(req: AuthenticatedRequest, res) => {
    const user = req.user;
    res.json(user);
})

export const getUserProfile = TryCatch(async(req, res) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(404).json({
            message: "No User with this id"
        })
        return;
    }

    res.json(user);

})


export const updateUser = TryCatch(async(req: AuthenticatedRequest, res) => {
    const {name, instagram, github, linkedin, bio} = req.body;
    const user = await User.findByIdAndUpdate(req.user?._id, {
        name,
        instagram,
        github,
        linkedin,
        bio
    }, {new: true});

    const token = jwt.sign({user}, process.env.JWT_SECRET as string, {
        expiresIn: "5d"
    })

    res.json({
        message: "User updated",
        token,
        user
    })

})

export const updateProfilePic = TryCatch(async(req: AuthenticatedRequest, res) => {
    const file = req.file

    if(!file) {
        res.status(400).json({
            message: "No file to upload"
        })
        return
    }

    const fileBuffer = getBuffer(file);

    if(!fileBuffer || !fileBuffer.content) {
        res.status(400).json({
            message: "Failed to generate buffer"
        })
        return
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs"
    })

    const user = await User.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url
    }, {new: true})

    const token = jwt.sign({user}, process.env.JWT_SECRET as string, {
        expiresIn: "5d"
    })

    res.json({
        message: "User profile pic updated",
        token,
        user
    })

})