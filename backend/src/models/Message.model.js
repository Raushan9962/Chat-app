import mangoose from "mongoose";
const messageSchema = new mangoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    text:{
        type:String,
       
    },
   image:{
    type:String,

},

},
{timestamps:true});
export default mangoose.model("Message",messageSchema);
