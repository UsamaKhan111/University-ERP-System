const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`University ERP API running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start University ERP API:", error.message);
  process.exit(1);
});
