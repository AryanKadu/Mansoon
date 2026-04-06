const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');

const dbUrl = 'mongodb+srv://user2:test2@cluster0.ri9f8dp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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
