import { app } from "./app.js";
import { connect } from "./db/index.js";
import dotenv from "dotenv"
dotenv.config({
    path:'./env'
})

connect()
.then(()=>{
    app.on('error',(error)=>{
        console.log("ERROR IN CONNECT APP",error)
    })
    app.listen(process.env.PORT,()=>{
        console.log(`app is listening on ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("DATABASE CONNECTION ERROR",error)
})