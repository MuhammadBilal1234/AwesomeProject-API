const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  permission: { type: Boolean, default: true },
});

module.exports = mongoose.model("User", UserSchema);
