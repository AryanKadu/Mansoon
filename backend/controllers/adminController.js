const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const Category = require('../models/category');


// const orderCount = await Order.countDocuments();


// Admin dashboard
exports.getDashboard = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
};

// Get all orders by a specific user
exports.getOrdersByUser = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/user-orders/${req.params.userId}`);
};

exports.getAddProduct = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/products/add`);
};

exports.postAddProduct = async (req, res) => {
  try {
    const { title, desc, category, price, tt, size } = req.body;
    const image = req.file ? req.file.path : ''; 

    const product = new Product({
      title,
      slug: title.toLowerCase().replace(/ /g, '-'),
      desc,
      category,
      price,
      image,
      tt,
      inStock: tt > 0,
      size
    });

    await product.save();

    // Return JSON for AJAX requests, otherwise redirect
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({ ok: true, product });
    }
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  } catch (err) {
    console.error('postAddProduct error:', err);
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(500).json({ ok: false, message: err.message || 'Error adding product' });
    }
    res.status(500).send('Error adding product');
  }
};

// Edit product - GET
exports.getEditProduct = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/products/edit/${req.params.id}`);
};

// Edit product - POST
exports.postEditProduct = async (req, res) => {
  try {
    const { title, desc, category, price, tt, size } = req.body;
    const updateData = {
      title,
      slug: title.toLowerCase().replace(/ /g, '-'),
      desc,
      price,
      category,
      tt,
      inStock: tt > 0,
      size
    };
    if (req.file) updateData.image = req.file.path;
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.json({ ok: true, product: updated });
    }
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  } catch (err) {
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(500).json({ ok: false, message: err.message || 'Error updating product' });
    }
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  }
};

// Toggle in-stock/out-of-stock
exports.toggleStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.inStock = !product.inStock;
    await product.save();
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  }
};

exports.getOrderDetails = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders/${req.params.id}`);
};

exports.getEditOrder = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders/edit/${req.params.id}`);
};

exports.postEditOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send('Order not found');

    const newPayment = Number(req.body.newPayment);
    if (!isNaN(newPayment) && newPayment > 0) {
      order.paidAmount = (order.paidAmount ?? 0) + newPayment;
      order.remainingAmount = Math.max(order.totalAmount - order.paidAmount, 0);
    }
    await order.save();
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders/${order._id}`);
  } catch (err) {
    res.status(500).send('Error updating order');
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
  } catch (err) {
    res.status(500).send('Error deleting order');
  }
};
