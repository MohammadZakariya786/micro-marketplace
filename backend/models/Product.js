const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  image: String,
});

productSchema.index({ title: 1 });

module.exports = mongoose.model("Product", productSchema);
