const mongoose = require("mongoose");

const RegionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  CityId: [{ type: mongoose.Schema.Types.ObjectId, ref: "City" }],
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

module.exports = mongoose.model("Region", RegionSchema);
