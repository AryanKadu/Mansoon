const mongoose = require('mongoose');

const visitorDaySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  count: { type: Number, default: 0 }
});

const visitorTotalSchema = new mongoose.Schema({
  key: { type: String, default: 'total', unique: true },
  count: { type: Number, default: 0 }
});

const VisitorDay = mongoose.model('VisitorDay', visitorDaySchema);
const VisitorTotal = mongoose.model('VisitorTotal', visitorTotalSchema);

module.exports = { VisitorDay, VisitorTotal }; 