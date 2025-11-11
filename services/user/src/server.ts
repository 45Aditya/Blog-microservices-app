import express from "express"
import dotenv from 'dotenv'
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.route.js"
import { v2 as cloudinary } from 'cloudinary'
import cors from 'cors'

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME || "", 
  api_key: process.env.CLOUD_API_KEY || "", 
  api_secret: process.env.CLOUD_API_SECRET || ""
});
 
const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/v1", userRoutes)

app.listen(5000, ()=> {
    console.log("hello world");
})