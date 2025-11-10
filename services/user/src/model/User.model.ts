import mongoose, { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  instagram: string;
  github: string;
  linkedin: string;
  bio: string;
}

const schema = new Schema<IUser>({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    image: { 
        type: String,
        required: true 
    },
    instagram: { 
        type: String 
    },
    github: { 
        type: String 
    },
    linkedin: { 
        type: String 
    },
    bio: { 
        type: String 
    },
    }, {
        timestamps: true
    }
);

const User = model<IUser>("User", schema);
export default User