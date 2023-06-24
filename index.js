const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User } = require("./models/userModel.js");
const userRoutes = require("./routes/userRoutes.js");
const homeRoutes = require("./routes/homeRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const logger = require("./util/logger.js");
const cors = require("cors");
const upload = require("./controllers/upload.js");

require("dotenv").config();

// instance
const app = express();
const PORT = 3001;
//database
mongoose
  .connect(process.env.DATA_BASE)
  .then(() => logger.info("database connected"))
  .catch((err) => {
    logger.info(err);
  });

//middelware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use("/uploads", express.static("uploads"));

// routes
app.use("/api", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.post("/",upload.none(), (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

//listen of the server
app.listen(PORT, () => {
  logger.info("server runing");
});
