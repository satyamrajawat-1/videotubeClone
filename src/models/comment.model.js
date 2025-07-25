import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

    commentSchema.plugin(mongooseAggregatePaginate)

    export const Comment = mongoose.model("Comment",commentSchema)