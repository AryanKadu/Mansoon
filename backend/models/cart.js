var express=require('express');
const mongoose=require('mongoose');
const Schema = mongoose.Schema
// mongoose.connect("mongodb+srv://based5985:U8Xpj4LofF3YOMGE@cluster0.ri9f8dp.mongodb.net/ecommerce?retryWrites=true&w=majority",{ useUnifiedTopology: true, useNewUrlParser: true  })

// Page schema 
const CartSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim: true
    },
    qt:{
        type:Number,
        
    },
    price:{
        type:Number,
        trim: true,
        required:true
    },
    image:{
        type:String,
        
    },
    username:{
        type:String,
        trim:true
    }
});
// module.exports = CartSchema;
module.exports = mongoose.model('Cart', CartSchema);

// var Page=mongoose.exports=mongoose.model('Page',PageSchema);