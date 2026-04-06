const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');

const dbUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

mongoose.connect(dbUrl)
  .then(async () => {
    console.log('Connected to DB');

    const Category = require('./models/category');

    const cat = new Category({ title: 'Juices', slug: 'juices' });
    await cat.save();


    console.log('Sample category inserted');
    mongoose.disconnect();
  }).catch(err => {
    console.log('DB connection error:', err);
  });
