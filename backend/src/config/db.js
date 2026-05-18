const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  if (!mongoUri) {
    console.warn("MONGODB_URI is missing. Starting backend without MongoDB connection in development mode.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.warn("Continuing without database connection in development mode.");
  }
};

module.exports = connectDB;
