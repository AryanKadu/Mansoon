// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const OrderSchema = new Schema({
//   user: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   items: [
//     {
//       product: {
//         type: Schema.Types.ObjectId,
//         ref: 'Product',
//         required: true
//       },
//       quantity: Number
//     }
//   ],
//   totalAmount: Number,
//   amountPaid: Number,
//   amountRemaining: Number,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Order', OrderSchema);

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Paid', 'Processing', 'Shipped', 'Delivered', 'COD Pending'], default: 'Paid' },
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    mobile: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
