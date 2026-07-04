const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    console.log("MONGO_URI =", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `MongoDB Connected: ${conn.connection.host}`.green.underline
    );
  } catch (error) {
    console.error(
      `MongoDB connection error: ${error.message}`.red.bold
    );
    process.exit(1);
  }
};

module.exports = connectDB;