const mongoose = require("mongoose");
const Branch = require("./BranchModel");

const ComplainSchema = new mongoose.Schema({
  UserId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  BranchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
  status: { type: String, default: "pending" },
  message: { type: String },
  imageName: { type: String, require: true },
  imagePath: { type: String, require: true },
  uri: { type: String, require: true },
  lt: { type: Number, required: true },
  ln: { type: Number, required: true },
  date: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Complain", ComplainSchema);
