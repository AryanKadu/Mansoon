var express=require('express');
const mongoose=require('mongoose');
const Schema = mongoose.Schema
// mongoose.connect("mongodb+srv://<username>:<password>@cluster0-owf5m.mongodb.net/cmscart?retryWrites=true&w=majority",{ useUnifiedTopology: true, useNewUrlParser: true  })

// User schema 
const UserSchema=new Schema({

       name:{
            type:String,
            required:true,
            trim: true
        },
        email:{
            type:String,
            required:true,
            trim: true
        }, 
        mobile: { type: String }, 
        username:{
            type:String,
            required:true,
            trim: true
        },
        password:{
            type:String,
            required:true,
            trim: true,
            
        },
        admin:{
            type:Number
        },
        addresses: [
            {
                fullName: String,
                street: String,
                city: String,
                state: String,
                pincode: String,
                mobile: String
            }
        ]
});
module.exports = mongoose.model('User', UserSchema);

// var User=mongoose.exports=mongoose.model('User',UserSchema);