const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express()
const port=process.env.local || 5002;


//middleware
app.use(cors({
  origin:["http://localhost:5173"],
  credentials:true,
}))
app.use(express.json())
app.use(cookieParser())








const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.tgzt8q2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

const serviceCollection=client.db("clean-co").collection("services")
const bookingCollection=client.db("clean-co").collection("bookings")

//verify token

const verify=async(req,res,next)=>{
    const token =req.cookies.token;
    // console.log("from gateman",token);
    // res.send('gateman ready')

     if(!token){
      return res.status(401).send({message:"you are not authorized"})
     }

    // verify a token symmetric
   jwt.verify(token, process.env.SECRET_TOKEN, function(err, decoded) {
          if(err){
            return res.status(401).send({message:"you are not authorized"})
          }
          // console.log("deccccc",decoded);

          //attach decoded user so that others can get it

          req.user=decoded;

          next()
    });

}







app.get("/api/v1/service",verify,async(req,res)=>{
    
  const result=await serviceCollection.find().toArray()

     res.send(result)
})


app.post("/api/v1/user/create-booking",async(req,res)=>{
    // console.log(req.body);
    const bookings=req.body;
    const result=await bookingCollection.insertOne(bookings)
    res.send(result)
})


//user specific bookings
app.get("/api/v1/user/bookings ",verify,async(req,res)=>{
    // console.log(req.body);
    const queryEmail=req.query.email;
    console.log(queryEmail)
     const tokenEmail=req.user.email
    
     if(queryEmail!==tokenEmail){
      return res.status(403).send({message:'forbidden access'})
     }

     let query={}
     if(queryEmail){
       query.email=queryEmail
     }

     const result=await bookingCollection.find(query).toArray()
     res.send(result)

     

})


app.delete("/api/v1/cancel-booking/:id",async(req,res)=>{
      // console.log(req.params.id);
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await bookingCollection.deleteOne(query);
      res.send(result)
})


//auth jwt

app.post("/api/v1/auth/access-token",async(req,res)=>{
      const user=req.body;  
      const token=jwt.sign(user,process.env.SECRET_TOKEN,{expiresIn:"1h"})
      // console.log("working",token);

      res.cookie("token",token,{
        httpOnly:true,
        secure:false,
        // sameSite:'n one',
      }).send({success:true})
         
})





    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);







app.get("/",(req,res)=>{
     res.send("data will comming soon......please wait")
})

app.listen(port,()=>{
    console.log(`this server is going on port ${port}`);
})