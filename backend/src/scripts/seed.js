const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");

const SEEDS_DIR = path.resolve(__dirname, "../../seeds");
const USERS_SEED_FILE = path.join(SEEDS_DIR, "users.seed.json");

const loadSeed = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Seed file is not valid JSON (${filePath}): ${error.message}`);
  }
};

const seedUsers = async ({ force }) => {
  const users = loadSeed(USERS_SEED_FILE);

  const results = { created: [], updated: [], skipped: [] };

  for (const entry of users) {
    const email = String(entry.email || "").toLowerCase().trim();
    if (!email) {
      console.warn("Skipping seed entry without email:", entry);
      continue;
    }

    const existing = await User.findOne({ email });

    if (!existing) {
      await User.create({ ...entry, email });
      results.created.push(email);
      continue;
    }

    if (!force) {
      results.skipped.push(email);
      continue;
    }

    existing.fullName = entry.fullName ?? existing.fullName;
    existing.role = entry.role ?? existing.role;
    existing.isActive = entry.isActive ?? existing.isActive;
    if (entry.password) {
      existing.password = entry.password;
    }
    await existing.save();
    results.updated.push(email);
  }

  return results;
};

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is missing. Set it in backend/.env before seeding.");
    process.exit(1);
  }

  const force = process.argv.includes("--force");

  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);

  try {
    const userResults = await seedUsers({ force });

    console.log("\nUsers seed summary:");
    console.log(`  created: ${userResults.created.length}`, userResults.created);
    console.log(`  updated: ${userResults.updated.length}`, userResults.updated);
    console.log(`  skipped: ${userResults.skipped.length}`, userResults.skipped);
    console.log(force ? "(--force passed: existing users were overwritten)" : "(re-run with --force to overwrite existing users)");
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
  mongoose.disconnect().finally(() => process.exit());
});
