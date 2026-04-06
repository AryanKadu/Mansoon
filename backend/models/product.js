// // var express=require('express');
// const { url } = require('inspector');
// const mongoose=require('mongoose');
// const mongoosePaginate=require('mongoose-paginate');
// const Schema = mongoose.Schema
// // mongoose.connect("mongodb+srv://based5985:U8Xpj4LofF3YOMGE@cluster0.ri9f8dp.mongodb.net/ecommerce?retryWrites=true&w=majority",{ useUnifiedTopology: true, useNewUrlParser: true  })

// // Product schema 
// const ProductSchema=new Schema({

//         title:{
//             type:String,
//             required:true,
//             trim: true
//         },
//         slug:{
//             type:String,
//             trim: true
//         }, 
//          desc:{
//             type:String,
//             required:true,
//             trim: true
//         },
//         category:{
//             type:String,
//             required:true,
//             trim: true
//         },
//         price:{
//             type:Number,
//             trim: true,
//             required:true
//         },
//         image:{
//             url:String
            
//         },
//         tt:{
//             type:Number,
//             required:true,
//             default:1
//         }

// });
// ProductSchema.plugin(mongoosePaginate);
// // module.exports = ProductSchema;

// module.exports = mongoose.model('Product', ProductSchema);


// // var Page=mongoose.exports=mongoose.model('Page',PageSchema);



const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

// Product schema
const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    trim: true
  },
  image: {
    type: String,       // Direct URL to image
    required: true,
    trim: true
  },
  tt: {
    type: Number,
    required: true,
    default: 1
  },
  inStock: {
  type: Boolean,
  default: true
  },
  size: { 
  type: Number ,
  required: true
  } // Size in ml
});

ProductSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', ProductSchema);
