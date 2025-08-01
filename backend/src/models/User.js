import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  
    email: {
        type: String,
        required: true,
        unique: true
    },
    FullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlenth: 6,

    },
    profilePic:{
        type: String,
        default: "",
    }
}, {
    timestamps: true
})
export default mongoose.model("User", userSchema);