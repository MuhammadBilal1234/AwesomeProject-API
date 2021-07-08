const mongoose = require("mongoose");
const Deptartment = require("./DepartmentModel");
const User = require("./UserModel");

const BranchSchema = new mongoose.Schema({
  CityId: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
  DeptId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Deptartment" }],
  UserId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: "1" }],
  SeniorId: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: "1" },
  ],
  name: { type: String, required: true, unique: true },
  latitude: { type: Number, required: true, unique: true },
  longitude: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model("Branch", BranchSchema);
