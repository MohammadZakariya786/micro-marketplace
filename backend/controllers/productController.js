const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.getProducts = async (req, res) => {
  const { page = 1, limit = 5, search = "" } = req.query;
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 5;
  const searchText = String(search || "").trim();

  const query = searchText
    ? { title: { $regex: searchText, $options: "i" } }
    : {};

  const [products, total] = await Promise.all([
    Product.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    total,
  });
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
};

exports.createProduct = async (req, res) => {
  const { title, price, description, image } = req.body;

  const product = await Product.create({
    title: title.trim(),
    price: Number(price),
    description: description.trim(),
    image: image.trim(),
  });
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const payload = {};

  if (req.body.title !== undefined) payload.title = req.body.title.trim();
  if (req.body.price !== undefined) payload.price = Number(req.body.price);
  if (req.body.description !== undefined)
    payload.description = req.body.description.trim();
  if (req.body.image !== undefined) payload.image = req.body.image.trim();

  const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
    runValidators: true,
    returnDocument: "after",
  }).lean();

  if (!updated) return res.status(404).json({ message: "Product not found" });

  res.json(updated);
};

exports.deleteProduct = async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Product not found" });

  res.status(204).send();
};

exports.toggleFavorite = async (req, res) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const productObjectId = new mongoose.Types.ObjectId(productId);
  const exists = await Product.exists({ _id: productObjectId });
  if (!exists) return res.status(404).json({ message: "Product not found" });

  const pullResult = await User.updateOne(
    { _id: req.user.id, favorites: productObjectId },
    { $pull: { favorites: productObjectId } }
  );

  if (pullResult.modifiedCount === 0) {
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { favorites: productObjectId } }
    );
  }

  const updatedUser = await User.findById(req.user.id).select("favorites");
  res.json({ favorites: (updatedUser?.favorites || []).map(String) });
};
