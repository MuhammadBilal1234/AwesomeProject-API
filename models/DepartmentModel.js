const mongoose = require("mongoose");

const DeptSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },
  label: { type: String, required: true },
});

module.exports = mongoose.model("Deptartment", DeptSchema);
