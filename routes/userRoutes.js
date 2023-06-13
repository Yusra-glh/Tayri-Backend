const express = require("express");
const {getAllUsers,getUserById} = require("../controllers/userController");
const route = express.Router();
const {verifyAccessToken} = require("../controllers/Middlewares");

route.get("/allUsers", getAllUsers);

route.get('/userById/:userId', verifyAccessToken, getUserById);
module.exports = route;
