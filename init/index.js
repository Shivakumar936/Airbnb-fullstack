const dns = require("dns");
try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch (e) {}
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to database:", dbUrl.includes("mongodb+srv") ? "MongoDB Atlas (Cloud)" : "Local DB");
}

const initDB = async () => {
  await main();
  
  // Clean existing listings
  await Listing.deleteMany({});
  console.log("Cleared existing listings.");

  // Check if a registered user exists to use as owner
  let ownerUser = await User.findOne({});
  let ownerId = ownerUser ? ownerUser._id : "687c71fa16bae78a2b5ce52c";

  console.log(`Using owner ID: ${ownerId}${ownerUser ? ` (${ownerUser.username})` : " (default)"}`);

  const formattedData = initData.data.map((obj) => ({
    ...obj,
    owner: ownerId,
  }));

  await Listing.insertMany(formattedData);
  console.log(`Successfully initialized ${formattedData.length} listings in the database!`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
};

initDB().catch((err) => {
  console.error("Error initializing database:", err);
  process.exit(1);
});