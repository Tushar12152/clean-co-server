const express = require('express');
const app=express()
const port=process.env.local || 5002;







app.get("/api/v1/service",(req,res)=>{
     res.send("it working goooooooood")
})

app.get("/",(req,res)=>{
     res.send("data will comming soon......please wait")
})

app.listen(port,()=>{
    console.log(`this server is going on port ${port}`);
})