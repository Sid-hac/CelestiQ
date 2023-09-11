const { Configuration, OpenAIApi } = require("openai");
const express  = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const_= require("lodash");
const axios = require('axios');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv").config();
const  HfInference = require("@huggingface/inference") ;



const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = process.env.PORT || 3000;



mongoose.connect("mongodb://0.0.0.0:27017/GPTUsersDB" , {useNewUrlParser : true , useUnifiedTopology : true});

userSchema = new mongoose.Schema({

  username : String,
  password : String
});

const User = new mongoose.model("user" , userSchema);

// assistant GPT
app.get("/" , function(req , res){

    res.render("home");
});

app.get("/register" , async(req , res) => {

     try {
         res.render("register");
     } catch (error) {
        console.log(error);
     }
});

app.get("/login" , async(req , res) => {

     try {


      res.render("login");
      
     } catch (error) {
         console.log(error);
     }
});

app.get("/GPT" , async (req , res) => {

  try {
      
    res.render("GPT");
  } catch (error) {
    
     console.log(error);
  }
});
app.get("/translator" , async(req , res) =>{

  try {
    
    res.render("translator");
  } catch (error) {
    
    console.log(error);
  }
});

// image generator
app.get("/text-to-speech" ,  function(req , res){

  res.render("text_to_speech");
})



app.post("/register" , async(req ,res) => {

  try {

     
    User.findOne({username : req.body.username})
      .then(foundUser =>{
           
        if(foundUser){

          res.render("register" , {message : "user found with this username"});
        }else{
                 
          bcrypt.hash(req.body.password , 10 , async(err , hash) =>{
           
            try {
              const newUser = new User({
      
                username : req.body.username,
                password : hash
              });
                 
               newUser.save();  
               res.redirect("/GPT");
              
              
            } catch (error) {
              
              console.log(error);
              res.render("register");
            }
              
          });

          
        }
      })
      .catch(err =>{
        console.log(err);
        res.render("register");
      })
    

  

 } catch (error) {
    
   console.log(error);
   res.render("register");
 }

});


app.post("/login" , async (req , res) => {

      try {

        User.findOne({username : req.body.username})
           .then(foundUser =>{

               if (foundUser) {
                  
                    bcrypt.compare(req.body.password , foundUser.password , async(err , result)=>{
                             
                      try {
                         
                        if(result){

                             res.redirect("/GPT");
                        }else{

                             res.render("login" , {message : "Incorrect Password"});
                        }

                      } catch (error) {
                        
                        console.log(error);
                        
                      }
                         
                    })
                            

                    
               }
           })
           .catch(err => {
                console.log(err);
           })
        
           

        
      } catch (error) {
        console.log(error);
      }
})

// Assistant GPT Post request
app.post("/GPT" , async(req , res) =>{
   try{

       const message = req.body.inputMessage;
       
       const configuration = new Configuration({
         apiKey: process.env.OPENAI_API_KEY,
       });
       const openai = new OpenAIApi(configuration);
       
       const completion = await openai.createChatCompletion({
         model: "gpt-3.5-turbo",
         messages: [{"role": "user", "content": message}],
       });
       const arrivedMessage = completion.data.choices[0].message.content;
         
       console.log(arrivedMessage);
       
       res.render("GPT" , {data : arrivedMessage});
   }catch(err){
       
      console.error(err.message);
      res.render("GPT" , { data : arrivedMessage});

   }

   
})

// image generator post request
app.post("/translator" , async ( req , res) => {

  try {

    const HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN;
    const hf = new HfInference(HF_ACCESS_TOKEN);   

    const result = await hf.translation({
      model: 't5-base',
      inputs: req.body.inputMessage
    })
    console.log(result);
    
  } catch (error) {
    
    console.log(error);
  }
 
 
})






app.listen(port , function(){
    console.log(`server started at port ${port}`);
 });

    









