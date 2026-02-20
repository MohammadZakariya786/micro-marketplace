const mongoose = require("mongoose");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendValidationError = (res, message) =>
  res.status(400).json({ message });

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return sendValidationError(res, "Name must be at least 2 characters");
  }
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return sendValidationError(res, "Valid email is required");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return sendValidationError(res, "Password must be at least 6 characters");
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return sendValidationError(res, "Valid email is required");
  }
  if (!password || typeof password !== "string") {
    return sendValidationError(res, "Password is required");
  }

  next();
};

const validateProductsQuery = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return sendValidationError(res, "page must be a positive integer");
  }
  if (
    limit !== undefined &&
    (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)
  ) {
    return sendValidationError(res, "limit must be an integer between 1 and 100");
  }

  next();
};

const validateProductPayload = (req, res, next) => {
  const { title, price, description, image } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return sendValidationError(res, "title is required");
  }
  if (price === undefined || Number.isNaN(Number(price)) || Number(price) < 0) {
    return sendValidationError(res, "price must be a non-negative number");
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return sendValidationError(res, "description is required");
  }
  if (!image || typeof image !== "string" || !image.trim()) {
    return sendValidationError(res, "image is required");
  }

  next();
};

const validateProductUpdatePayload = (req, res, next) => {
  const allowedFields = ["title", "price", "description", "image"];
  const payloadKeys = Object.keys(req.body || {});

  if (payloadKeys.length === 0) {
    return sendValidationError(res, "At least one field is required for update");
  }

  const hasInvalidField = payloadKeys.some((key) => !allowedFields.includes(key));
  if (hasInvalidField) {
    return sendValidationError(
      res,
      "Only title, price, description, image can be updated"
    );
  }

  const { title, price, description, image } = req.body;

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return sendValidationError(res, "title must be a non-empty string");
  }
  if (
    price !== undefined &&
    (Number.isNaN(Number(price)) || Number(price) < 0)
  ) {
    return sendValidationError(res, "price must be a non-negative number");
  }
  if (
    description !== undefined &&
    (typeof description !== "string" || !description.trim())
  ) {
    return sendValidationError(res, "description must be a non-empty string");
  }
  if (image !== undefined && (typeof image !== "string" || !image.trim())) {
    return sendValidationError(res, "image must be a non-empty string");
  }

  next();
};

const validateObjectIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendValidationError(res, "Invalid id");
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProductsQuery,
  validateProductPayload,
  validateProductUpdatePayload,
  validateObjectIdParam,
};
