require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    title: "Noise-Canceling Wireless Headphones X9",
    price: 199.99,
    description:
      "Over-ear Bluetooth headphones with active noise cancellation and 40-hour battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  },
  {
    title: "UltraLight Mechanical Keyboard Pro",
    price: 129.0,
    description:
      "Hot-swappable mechanical keyboard with RGB backlight and low-latency wired mode.",
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTFS6U37rlQANcRdlMs9gjy7RfCf_8LY7LJysS0_gjCUGh6bFdyoSvbYQrpQCAxfUYpD51PbqepoW7kJ0J3LB_m5-tZsgTfcLqcUF7fiSUGnDygZzjNgb6Rh1g",
  },
  {
    title: "4K USB-C Monitor 27-inch",
    price: 329.5,
    description:
      "Crisp 4K display with 95% DCI-P3 color and single-cable USB-C connectivity.",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
  },
  {
    title: "Portable SSD 2TB Gen4",
    price: 179.99,
    description:
      "Compact NVMe external SSD with up to 2000MB/s transfer speed and shock resistance.",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704",
  },
  {
    title: "Smartwatch Active Pulse",
    price: 149.99,
    description:
      "Fitness-focused smartwatch with heart-rate tracking, GPS, and 7-day battery.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  },
  {
    title: "Triple-Camera Smartphone Nova 5G",
    price: 649.0,
    description:
      "5G smartphone featuring AMOLED display, 120Hz refresh rate, and fast charging.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  },
  {
    title: "Gaming Mouse Precision 26K",
    price: 79.0,
    description:
      "Ergonomic gaming mouse with 26,000 DPI sensor and programmable side buttons.",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
  },
  {
    title: "Wi-Fi 6 Mesh Router Duo Pack",
    price: 219.0,
    description:
      "Whole-home Wi-Fi 6 mesh system with seamless roaming and parental controls.",
    image: "https://www.elfcams.com/wp-content/uploads/c5abbe9c-78f7-47cf-992e-8255f9ed37b4-1.png",
  },
  {
    title: "Action Camera 5K Stabilized",
    price: 259.99,
    description:
      "Waterproof action camera with 5K capture, advanced stabilization, and voice control.",
    image: "https://digitek.net.in/cdn/shop/files/img57.jpg?v=1763528677&width=800",
  },
  {
    title: "Bluetooth Speaker Mini Boom",
    price: 59.99,
    description:
      "Portable speaker with deep bass, IPX7 water resistance, and 16-hour playback time.",
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab",
  },
];

const seedUsers = async () => {
  const users = [
    {
      name: "Demo User One",
      email: "demo1@example.com",
      password: await bcrypt.hash("Password@123", 10),
    },
    {
      name: "Demo User Two",
      email: "demo2@example.com",
      password: await bcrypt.hash("Password@123", 10),
    },
  ];

  await User.deleteMany({
    email: { $in: users.map((u) => u.email) },
  });

  await User.insertMany(users);
};

(async () => {
  await Product.deleteMany();
  await Product.insertMany(products);
  await seedUsers();

  console.log("Seeded products and users");
  console.log("Test credentials:");
  console.log("1) demo1@example.com / Password@123");
  console.log("2) demo2@example.com / Password@123");

  process.exit();
})();
