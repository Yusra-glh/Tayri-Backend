const express = require("express");
const upload = require("../controllers/upload")
const {signup,signin,logout,logoutAll,newAccessToken,newRefreshToken } = require("../controllers/authController");

const route = express.Router();

route.post('/signup', upload.array('gallery',10),signup);
route.post('/signin', signin);
route.post('/logout', logout);
route.post('/logoutAll', logoutAll);
route.post('/accessToken', newAccessToken);
route.post('/refreshToken', newRefreshToken);


module.exports = route;
