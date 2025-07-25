import mongoose , {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    },
    {
        timestamps:true
    }

)

export const Like = mongoose.model("Like",likeSchema)