// var express=require('express');
const mongoose=require('mongoose');
const Schema = mongoose.Schema
// mongoose.connect("mongodb+srv://based5985:U8Xpj4LofF3YOMGE@cluster0.ri9f8dp.mongodb.net/ecommerce?retryWrites=true&w=majority",{ useUnifiedTopology: true, useNewUrlParser: true  })

// Page schema 
const PageSchema=new Schema({

        title:{
            type:String,
            required:true,
            trim: true
        },
        slug:{
            type:String,
            trim: true
        }, 
         content:{
            type:String,
            required:true,
            trim: true
        },
        sorting:{
            type:Number,
            trim: true,
            default: 100
        }

});
// module.exports = PageSchema;

module.exports = mongoose.model('Page', PageSchema);



// var Page=mongoose.exports=mongoose.model('Page',PageSchema);