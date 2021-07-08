const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var cors = require("cors");

app.use(cors());

app.use(bodyParser.json());
mongoose.connect("mongodb://localhost/muncipalwatchdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.once("open", () => console.log("Connected to Database"));
const UserRouter = require("./routes/user");
app.use("/user", UserRouter);

app.listen(3000, () => console.log(`Server Started on Port 3000`));
