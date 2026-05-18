const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);

  let message = error.message || "Internal server error";

  if (error.code === 11000) {
    message = "Duplicate field value entered";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
