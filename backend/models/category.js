var express=require('express');
const mongoose=require('mongoose');
const Schema = mongoose.Schema
// mongoose.connect("mongodb+srv://based5985:U8Xpj4LofF3YOMGE@cluster0.ri9f8dp.mongodb.net/ecommerce?retryWrites=true&w=majority",{ useUnifiedTopology: true, useNewUrlParser: true  })

// Category schema 
const CategorySchema=new Schema({

        title:{
            type:String,
            required:true,
            trim: true
        },
        slug:{
            type:String,
            trim: true
        }, 
      
});
// module.exports = CategorySchema;
module.exports = mongoose.model('Category', CategorySchema);
