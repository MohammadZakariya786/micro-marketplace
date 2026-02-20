require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/authRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
