import mongoose , {Schema} from "mongoose";

const commentSchema = new Schema(
    {
        content:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        commentAt:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    },
    {
        timestamps:true
    })

    export const Comment = mongoose.model("Comment",commentSchema)