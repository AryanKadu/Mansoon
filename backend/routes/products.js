const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs-extra');
const auth = require('../config/auth');
const isUser = auth.isUser;

// Get models
const Product = require('../models/product');
const Category = require('../models/category');

/*
 * GET all products 
 */
router.get('/', async function (req, res) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/products`);
});

router.get('/:category', async function (req, res) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/products?category=${req.params.category}`);
});

router.get('/:category/:product', async function (req, res) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${req.params.category}/${req.params.product}`);
});

module.exports = router;
