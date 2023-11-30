const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  age: Number,
  pincode: String,
  aadharCardNumber: String,
  password: String,
});

module.exports = mongoose.model('User', userSchema);
