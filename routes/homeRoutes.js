const express = require("express");
const {updateWard,deleteWard } = require("../controllers/userController");

const route = express.Router();
 
route.route("/").put(updateWard).delete(deleteWard);

module.exports = route;
