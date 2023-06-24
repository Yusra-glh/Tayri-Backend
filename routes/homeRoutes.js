const express = require("express");
const {updateWard,deleteWard } = require("../controllers/userController");

const route = express.Router();
 
route.route("/").get(updateWard).delete(deleteWard);

module.exports = route;
