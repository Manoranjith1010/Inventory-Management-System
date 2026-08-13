const mongoose = require("mongoose");

const connectDB = async (mongoUri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
};

module.exports = connectDB;
