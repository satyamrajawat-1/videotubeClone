import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connect = async()=>{
    try {
        const connectioInstance = await mongoose.connect(`${process.env.URI}/${DB_NAME}`)
         console.log(`Mongo Db connected !! DB HOST : ${connectioInstance.connection.host}`)
    } catch (error) {
        console.log("ERROR IN CONNNECTIN DATABASE !!")
        process.exit(1)
    }
}


export {connect}