const express = require("express");
const http = require("http");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const GeoPoint = require("geopoint");

const User = require("../models/UserModel");
const Complain = require("../models/ComplainModel");
const Department = require("../models/DepartmentModel");
const City = require("../models/CityModel");
const Region = require("../models/RegionModel");
const Branch = require("../models/BranchModel");

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "./uploads");
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}.jpg`);
  },
});

const upload = multer({
  storage: storage,
});

// Register Complain
router.post("/complain", upload.single("image"), async (req, res) => {
  jwt.verify(req.body.token, "secretkey", async (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      // console.log("file", req.file.filename);
      // // console.log("filePath", req.file.path);
      // console.log("body", req.body);
      // console.log(authData.searchUser._id);
      const dept = await Department.findOne({ value: req.query.deprt });

      console.log(dept);
      const branch = await Branch.find({ DeptId: dept._id });

      console.log(branch);

      const lt = req.body.lt;
      const ln = req.body.ln;

      const point1 = new GeoPoint(Number(lt), Number(ln));
      const point2 = new GeoPoint(branch[0].latitude, branch[0].longitude);
      let distance = point1.distanceTo(point2, true);
      //console.log(distance);
      let index = 0;
      for (let i = 1; i < branch.length; i++) {
        const point2 = new GeoPoint(branch[i].latitude, branch[i].longitude);
        var dis = point1.distanceTo(point2, true);
        // console.log(dis);
        if (distance > dis) {
          distance = dis;
          index = i;
        }
      }

      console.log(distance, index);
      console.log(branch[index]._id);
      const newComplainModel = new Complain({
        UserId: authData.searchUser._id,
        BranchId: branch[index]._id, // add branch id
        imageName: req.file.filename,
        imagePath: req.file.path,
        message: req.body.message,
        lt: req.body.lt,
        ln: req.body.ln,
        uri: req.query.uri,
      });

      // console.log(newComplainModel);

      try {
        const newComplain = await newComplainModel.save();
        console.log(newComplain);
        res.json(newComplain);
      } catch (err) {
        res.json({ message: err.message });
      }
    }
  });
});

//Initialize Departments
router.get("/dep", async (req, res) => {
  const depModel = new Department({
    value: "CDA",
    label: "CDA",
  });

  try {
    const newDep = await depModel.save();
    res.json(newDep);
  } catch (error) {
    console.log(error);
  }
});

//Get All Departments
router.get("/getDept", async (req, res) => {
  try {
    const allDept = await Department.find();
    console.log(allDept);
    res.json(allDept);
  } catch (error) {
    res.json({ message: error.message });
  }
});

// Get All Users
router.get("/", async (req, res) => {
  try {
    const allUser = await User.find();
    res.json(allUser);
  } catch (err) {
    res.json({ messae: err.message });
  }
});

// Update Department User [Change Permission]
router.post("/updateuser", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.query.id },
      { permission: true }
    );

    const branch = await Branch.findOneAndUpdate(
      { _id: req.query.branch },
      { UserId: user._id }
    );
    console.log(user, branch);
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

// All Department Heads

router.post(`/newsup`, async (req, res) => {
  console.log(req.query.name, req.query.id);
  try {
    const searchSup = await User.findOne({ name: req.query.name });
    console.log(searchSup._id);

    const UpdateSup = await Branch.findOneAndUpdate(
      { _id: req.query.id },
      { UserId: searchSup._id }
    );

    console.log(UpdateSup);
    res.json(UpdateSup);
  } catch (error) {
    res.json(error);
    console.log(error);
  }
});

router.post(`/newsenior`, async (req, res) => {
  console.log(req.query.name, req.query.id);
  try {
    const searchsenior = await User.findOne({ name: req.query.name });
    console.log(searchsenior._id);

    const Updatesenior = await Branch.findOneAndUpdate(
      { _id: req.query.id },
      { SeniorId: searchsenior._id }
    );

    console.log(Updatesenior);
    res.json(Updatesenior);
  } catch (error) {
    res.json(error);
    console.log(error);
  }
});

router.get(`/deph`, async (req, res) => {
  try {
    const deptheads = await User.find({ role: "Supervisor" });
    console.log(deptheads);
    res.json(deptheads);
  } catch (error) {
    res.json(error);
  }
});

router.get(`/deptsenior`, async (req, res) => {
  try {
    const deptsenior = await User.find({ role: "Senior" });
    console.log(deptsenior);
    res.json(deptsenior);
  } catch (error) {
    res.json(error);
  }
});

//Get All Complains
router.get("/allcomplain", async (req, res) => {
  try {
    const allComplain = await Complain.find();
    res.json(allComplain);
  } catch (err) {
    res.json({ messae: err.message });
  }
});

// Get All Un-Verified Departmental Users
router.get("/newreq", async (req, res) => {
  try {
    const newEmp = await User.find({ role: "Department", permission: false });
    res.json(newEmp);
  } catch (err) {
    res.json({ message: err.message });
  }
});

// Get All Staff Members
router.get("/staff", async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: "Public" } });

    res.json(staff);
  } catch (error) {
    res.json(error);
  }
});

// Get Staff Branch
router.get("/staffbranch", async (req, res) => {
  try {
    const branch = await Branch.find({ UserId: req.query.id });
    if (branch) {
      res.json(branch);
    } else {
      const branch = await Branch.find({ SeniorId: req.query.id });
      res.json(branch);
    }
  } catch (error) {
    res.json(error);
  }
});

//Change Verify Status

// Get Specific User Complain
router.get("/usercomplain", async (req, res) => {
  try {
    jwt.verify(req.query.token, "secretkey", async (err, authData) => {
      const userComplain = await Complain.find({
        UserId: authData.searchUser._id,
      });
      console.log(userComplain);
      res.json(userComplain);
    });
  } catch (error) {
    console.log("error");
  }
});

//Signup
router.post("/", async (req, res) => {
  const newUserModel = new User({
    name: req.query.name,
    password: req.query.password,
    role: req.query.role,
  });

  try {
    const newUser = await newUserModel.save();
    console.log(newUser);
    res.send(newUser);
  } catch (err) {
    res.json({ message: err.message });
  }
});

//SignIn
router.post("/signin", async (req, res) => {
  const name = req.query.name;
  const password = req.query.password;

  const searchUser = await User.findOne({ name, password });

  if (searchUser) {
    jwt.sign({ searchUser }, "secretkey", (err, token) => {
      console.log(token);
      res.json({
        token,
        searchUser,
      });
    });
  } else {
    res.send(searchUser);
  }
});

// City and Region

router.get("/cityandregion", async (req, res) => {
  const newRegionModel = new Region({
    name: "FAIZABAD",
    CityId: "608cfb597dab100558934114",
    latitude: "33.66299636618663",
    longitude: "73.08494254946709",
  });

  try {
    const newRegion = await newRegionModel.save();
    console.log(newRegion);
    res.json(newRegion);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/getcity", async (req, res) => {
  try {
    const city = await City.find();
    res.json(city);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/getdepartment", async (req, res) => {
  try {
    const department = await Department.find();
    res.json(department);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/getregion", async (req, res) => {
  try {
    console.log(req.query.name);
    if (req.query.name === "Rawalpindi") {
      const region = await Region.find({ CityId: "608cfb597dab100558934114" });

      res.json(region);
    } else {
      const city = await City.findOne({ name: req.query.name });

      const region = await Region.find({ CityId: city._id });

      res.json(region);
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

// Branches

router.get("/allbranch", async (req, res) => {
  try {
    const branch = await Branch.find();
    res.json(branch);
  } catch (error) {
    res.json({ message: err.message });
  }
});

router.get("/searchbranch", async (req, res) => {
  try {
    const branch = await Branch.findOne({ _id: req.query.id })
      .populate("SeniorId")
      .populate("UserId");
    console.log(branch);
    res.json(branch);
  } catch (error) {}
});

router.get("/allbranchpop", async (req, res) => {
  try {
    const branch = await Branch.find().populate("DeptId");
    res.json(branch);
    console.log(branch);
  } catch (error) {
    console.log(error);
    res.json({ message: err.message });
  }
});

router.get("/regionbasedbranch", async (req, res) => {
  try {
    const region = await Region.findOne({ name: req.query.name });
    const dep = await Department.findOne({ value: req.query.dept });
    console.log(region);
    const branch = await Branch.find({
      RegionId: region._id,
      DeptId: dep._id,
      UserId: [],
    });

    console.log(branch);
    res.json(branch);
  } catch (error) {
    console.log(error);
  }
});

router.post("/addbranch", async (req, res) => {
  let Cid = "";
  let Did = "";
  let Rid = "";

  try {
    if (req.query.city === "Rawalpindi") {
      Cid = "608cfb597dab100558934114";
    } else {
      const city = await City.findOne({ name: req.query.city });
      Cid = city._id;
    }

    const dept = await Department.findOne({ value: req.query.dept });
    Did = dept._id;

    console.log(Rid, Cid, Did);

    const newBranchModel = new Branch({
      CityId: Cid,
      DeptId: Did,
      latitude: req.query.lt,
      longitude: req.query.ln,
      name: req.query.name,
    });

    const newBranch = await newBranchModel.save();
    console.log(newBranch);
    res.json(newBranch);
  } catch (error) {
    console.log(error);
  }
});

router.post("/addsupervisor", async (req, res) => {
  try {
    console.log(req.query.branch);
    console.log(req.query.id);
    const branch = await Branch.findOneAndUpdate(
      { name: req.query.branch },
      { UserId: req.query.id }
    );
    console.log(branch);
    res.json(branch);
  } catch (error) {}
});

router.post("/addsenior", async (req, res) => {
  console.log(req.query.branch);
  const b = req.query.branch.split(",");
  console.log(b);

  for (let i = 0; i < b.length; i++) {
    console.log(b[i], req.query.id);
    const branch = await Branch.findOneAndUpdate(
      { _id: b[i] },
      { SeniorId: req.query.id }
    );
  }
  res.json("Done");
});

router.post("/complainmap", async (req, res) => {
  console.log("Start " + req.query.token);
  jwt.verify(req.query.token, "secretkey", async (err, authData) => {
    try {
      console.log("Token " + authData.searchUser._id);

      const branch = await Branch.findOne({ UserId: authData.searchUser._id });
      console.log(branch._id);

      const complain = await Complain.find({ BranchId: branch._id });
      console.log(complain);
      res.json(complain);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  });
});

router.get("/unresolved", async (req, res) => {
  jwt.verify(req.query.token, "secretkey", async (err, authData) => {
    try {
      const branch = await Branch.find({ SeniorId: authData.searchUser._id });

      let firstres = [];
      let finalres = [];
      let currentDate = Date.now();

      for (let i = 0; i < branch.length; i++) {
        const c = await Complain.find({
          BranchId: branch[i]._id,
          status: ["pending", "InProcess"],
        }).populate("BranchId");

        //console.log(c);

        c.length > 0 ? firstres.push(...c) : null;
      }

      for (let j = 0; j < firstres.length; j++) {
        let diff = currentDate - firstres[j].date;
        let Difference_In_Days = diff / (1000 * 3600 * 24);

        if (Math.round(Difference_In_Days) > 7) {
          finalres.push(firstres[j]);
          console.log(Math.round(Difference_In_Days));
        }
      }

      res.json(finalres);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  });
});

router.get("/daterange", async (req, res) => {
  jwt.verify(req.query.token, "secretkey", async (err, authData) => {
    try {
      var sdate = new Date(req.query.sdate);
      var edate = new Date(req.query.edate);

      console.log(sdate);

      const branch = await Branch.find({ SeniorId: authData.searchUser._id });
      console.log(branch);
      let complains = [];
      for (let i = 0; i < branch.length; i++) {
        const c = await Complain.find({
          BranchId: branch[i]._id,
          date: { $gte: sdate, $lte: edate },
        }).populate("BranchId");

        c.length > 0 ? complains.push(...c) : null;
      }

      for (let i = 0; i < branch.length; i++) {
        console.log(branch[i]._id);
      }

      console.log(complains);
      res.json(complains);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  });
});

router.post("/changestatus", async (req, res) => {
  console.log("status " + req.query.status);
  try {
    const complain = await Complain.findOneAndUpdate(
      { _id: req.query.id },
      { status: req.query.status }
    );

    console.log(complain);
  } catch (error) {
    console.log(error);
  }
});

router.get("/fullcomplain", async (req, res) => {
  console.log("object");
  try {
    const complain = await Complain.find({ _id: req.query.id }).populate(
      "BranchId"
    );
    console.log(complain);
  } catch (error) {}
});

module.exports = router;
