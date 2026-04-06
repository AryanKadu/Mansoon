const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Homepage route
router.get('/', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/home`);
});



module.exports = router;
