const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const apiRoutes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (_origin, callback) => callback(null, true),
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
