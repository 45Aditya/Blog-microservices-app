import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  github: string;
  linkedin: string;
  bio: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const authHeader =  req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "Please login - No auth header"
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decodedValue = jwt.verify(token as string, process.env.JWT_SECRET as string) as JwtPayload

        if(!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: "Invalid Token"
            });
            return;
        }

        req.user = decodedValue.user;
        next();

    } catch (error) {
        console.log("JWT verification error: ", error);
        res.status(401).json({
            message: "Please login - JWT error"
        });
    }
}