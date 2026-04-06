const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');

// GET add product to cart
router.get('/add/:product', async function (req, res) {
    const slug = req.params.product;
    try {
        const p = await Product.findOne({ slug });
        if (!p) return res.status(404).json({ message: "Product not found" });

        const cartItem = new Cart({
            title: slug,
            qt: 1,
            price: parseFloat(p.price).toFixed(2),
            image: '/product_images/' + p._id + '/' + p.image,
            username: req.cookies.username || 'guest'
        });
        await cartItem.save();

        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.json({ ok: true, message: 'Product added' });
        }
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
    } catch (err) {
        if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
            return res.status(500).json({ message: 'Server error' });
        }
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/`);
    }
});

// GET checkout page
router.get('/checkout', (req, res) => res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`));

// GET update product
router.get('/update/:product', async function (req, res) {
    const slug = req.params.product;
    const action = req.query.action;
    const isAjax = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
    try {
        const item = await Cart.findOne({ username: req.cookies.username, title: slug });
        if (!item) {
            if (isAjax) return res.json({ ok: false, message: 'Item not found' });
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
        }

        if (action === 'add') await Cart.findOneAndUpdate({ _id: item._id }, { qt: item.qt + 1 });
        else if (action === 'remove') {
            if (item.qt <= 1) await Cart.findOneAndDelete({ _id: item._id });
            else await Cart.findOneAndUpdate({ _id: item._id }, { qt: item.qt - 1 });
        }
        else if (action === 'clear') await Cart.findOneAndDelete({ _id: item._id });

        if (isAjax) return res.json({ ok: true });
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
    } catch (err) {
        if (isAjax) return res.status(500).json({ ok: false, message: 'Server error' });
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
    }
});

// GET clear cart
router.get('/clear', async function (req, res) {
    const isAjax = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
    try {
        await Cart.deleteMany({ username: req.cookies.username });
        delete req.session.cart;
        if (isAjax) return res.json({ ok: true });
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
    } catch (err) {
        if (isAjax) return res.status(500).json({ ok: false, message: 'Server error' });
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);
    }
});

router.post('/buynow', async (req, res) => {
  try {
    const username = req.cookies.username;
    if (!req.user || !username) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);

    const cartItems = await Cart.find({ username }).lean();
    if (!cartItems || cartItems.length === 0) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`);

    let totalAmount = 0;
    const items = [];

    for (let item of cartItems) {
      const product = await Product.findOne({ slug: item.title });
      if (product) {
        totalAmount += product.price * item.qt;
        items.push({ product: product._id, quantity: item.qt, price: product.price });
        product.tt -= item.qt;
        product.inStock = product.tt > 0;
        await product.save();
      }
    }

    const newOrder = new Order({
      user: req.user._id,
      items,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
    });

    await newOrder.save();
    await Cart.deleteMany({ username });
    delete req.session.cart;

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/thank-you`);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

router.post('/direct-buy/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.body.quantity) || 1;

    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/products`);
    }

    if (product.tt < quantity) {
      return res.redirect('back');
    }

    const totalAmount = product.price * quantity;

    const order = new Order({
      user: req.user._id,
      items: [{
        product: product._id,
        quantity,
        price: product.price
      }],
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
    });

    await order.save();

    product.tt -= quantity;
    product.inStock = product.tt > 0;
    await product.save();

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/thank-you`);
  } catch (err) {
    console.error("Direct Buy error:", err);
    res.status(500).send("Server Error");
  }
});




module.exports = router;
