const express = require("express");
const upload = require("../controllers/upload");
const multer = require('multer');

const {
  signup,
  registerPhoneVerification,
  signinStep1,
  signinStep2,
  logout,
  logoutAll,
  newAccessToken,
  newRefreshToken,
  sendVerificationCode,
  isPhoneVerified,
  verifyOTP,
  signupStep1,
  signupStep2,
  signupStep3,
  signupFinalStep
} = require("../controllers/authController");

const route = express.Router();

route.post("/signup",upload.array("gallery", 10), signupStep1,isPhoneVerified,signupStep2,signupStep3,signupFinalStep);


// route.post("/signup", signupStep1,signupStep2,signupStep3,signup,upload.array("gallery", 10),(req,res)=>{
//   res.send("hello")
// });
route.post("/signup/step1", signupStep1,sendVerificationCode,(req,res)=>{
  res.send("code sent successfully !")
});
route.post("/signup/step2", signupStep2,(req,res)=>{
  res.send("Step 2 verified !")
});
route.post("/signup/step3", signupStep3,(req,res)=>{
  res.send("Step 3 verified !")
});
route.post("/signin", signinStep1, sendVerificationCode, signinStep2);
route.post("/signin/phoneVerif", registerPhoneVerification);
route.post("/signin/verify", verifyOTP);
route.post("/logout", logout);
route.post("/logoutAll", logoutAll);
route.post("/accessToken", newAccessToken);
route.post("/refreshToken", newRefreshToken);
/*route.get("/", signupStep1, (req, res) => {
  res.send("first Step done");
});*/

module.exports = route;
