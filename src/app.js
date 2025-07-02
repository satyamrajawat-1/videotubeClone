import cookieParser from "cookie-parser"
import cors from "cors"
import express, { json, urlencoded } from "express"
const app = express()


app.use(cookieParser())


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))


app.use(express.json({
    limit:"16kb"
}))


app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))


app.use(express.static("public"))


import userRoute from "./routes/user.route.js"

app.use("/api/v1/user",userRoute)


export {app}

