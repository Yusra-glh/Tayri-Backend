const jwt = require("jsonwebtoken");
const { User,userValidation,userStep1Validation,userStep2Validation } = require("../models/userModel");
const { OTPModel } = require("../models/OTPModel");
const { GenderEnum } = require("../models/genderEnum");
const { RefreshToken } = require("../models/refreshTokenModel");
require('dotenv').config();
const {errorHandler, withTransaction} = require("../util/util");
const HttpError = require("../util/HttpError");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SID;
const twilioNumber = process.env.TWILIO_NUMBER;
const upload = require("../controllers/upload")
const client = require('twilio')(accountSid, authToken);


function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function createAccessToken(userId) {
  return jwt.sign({
      userId: userId
  }, process.env.ACCESS_TOKEN_SECRET, {
     expiresIn: '7d'
  });
}

function createRefreshToken(userId, refreshTokenId) {
  return jwt.sign({
      userId: userId,
      tokenId: refreshTokenId
  }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '30d'
  });
}

/***************************************************************  SIGNIN  *********************************************************************** */
async function signinStep1(req, res, next) {
  try{
    const {phone} = req.body;
    const user = await User.findOne({phone });
    if (!user) {
      return  res.status(401).json({
        error: 'Wrong username or password',
      });
    }

  res.locals.phone =phone;
  res.locals.user=user; 
  next();
  }catch(e){
    console.log(e.message);
    res.status(400).json({
      error: "An error has occured , please verify your information",
    });
  }
}


async function signinStep2(req, res, next) {
  try{
    const user= res.locals.user
    if (!user) {
      return  res.status(401).json({
        error: 'An error has occured , please verify your information"',
      });
     }
    const refreshTokenDoc = RefreshToken({
      owner: user.id
    });
    await refreshTokenDoc.save();
  
    const refreshToken = createRefreshToken(user.id, refreshTokenDoc.id);
    const accessToken = createAccessToken(user.id);

    return res.status(200).json({
      user: user,
      accessToken,
      refreshToken
    });
 
  }catch(e){
    console.log(e.message);
    res.status(400).json({
      error: "An error has occured , please verify your information",
    });
  }
}

const sendVerificationCode = async (req, res, next) => {
  try {
    const phone =res.locals.phone;
    if (!phone) {
      return  res.status(401).json({
        error: 'An error has occured , please verify your information"',
      });
     }
    let digits="0123456789";
    let OTP="";
    for(let i=0;i<6;i++){
     OTP+=digits[Math.floor(Math.random()*10)];
    }

    const message = await client.messages.create({
      body: 'Your verification code for Tayri app is ' + OTP,
      messagingServiceSid: messagingServiceSid,
      to: phone,
      from: twilioNumber,
    });
    const oldOtpModel = await OTPModel.findOne({phone});
    if (oldOtpModel) {
      const newOtpModel = await OTPModel.updateOne({_id:oldOtpModel._id},{ sid:message.sid,
        phone:phone,
        code:OTP,verified: false });
    }else{
      const otpModel = await OTPModel.create({
        sid:message.sid,
        phone:phone,
        code:OTP
      });
      console.log("otpModel",otpModel);
    }
    next();
  } catch (error) {
    console.error('Error sending verification code:', error);
    return  res.status(400).json({
      error: error.message,
    });
  }
};

/************************************** SIGNUP PHONE VERIFICATION ********************************/
const registerPhoneVerification = async (req,res,next) => {
  try {
    const {phone} = req.body;
    const user = await User.findOne({phone });
    if (!user) {
      return  res.status(401).json({
        error: 'Wrong username or password',
      });
    }
    let digits="0123456789";
    let OTP="";
    for(let i=0;i<6;i++){
     OTP+=digits[Math.floor(Math.random()*10)];
    }
    const message = await client.messages.create({
      body: 'Your verification code for Tayri app is ' + OTP,
      messagingServiceSid: messagingServiceSid,
      to: phone,
      from: twilioNumber,
    });
    const oldOtpModel = await OTPModel.findOne({phone});
    if (oldOtpModel) {
      const newOtpModel = await OTPModel.updateOne({_id:oldOtpModel._id},{ sid:message.sid,
        phone:phone,
        code:OTP,verified: false });
    }else{
      const otpModel = await OTPModel.create({
        sid:message.sid,
        phone:phone,
        code:OTP
      });
      console.log("otpModel",otpModel);
    }
   return res.status(200).json({
    message:"Code sent successfully!",
  }); 
  } catch (error) {
    console.error('Error sending verification code:', error);
  }
};

async function isPhoneVerified(req, res, next) {
  try{
    const phone =res.locals.phone;
    console.log('phone ====================================');
    console.log(phone);
    console.log('====================================');
    const otpModel = await OTPModel.findOne({phone});
    if (!otpModel) {
      return  res.status(401).json({
        error: 'Phone number is not verified ! Please try again',
      });
    }
    if(otpModel.verified!==true){
      return  res.status(401).json({
        error: 'Incorrect OTP',
      });
    }

    next();
  }catch(e){
    console.log(e.message);
    res.status(400).json({
      error: "An error has occured , please verify your information",
    });
  }
  };

async function verifyOTP(req, res, next) {
try{
  const { phone,code } = req.body;
  const otpModel = await OTPModel.findOne({phone});
  if (!otpModel) {
    return  res.status(401).json({
      error: 'Phone number is not verified ! Please try again',
    });
  }
  if(otpModel.code!==code){
    return  res.status(401).json({
      error: 'Incorrect OTP',
    });
  }
  const newOtpModel = await OTPModel.updateOne({_id:otpModel._id},{ verified: true });
  return res.status(200).json({
    message:"Code validated successfully!",
  })
}catch(e){
  console.log(e.message);
  res.status(400).json({
    error: "An error has occured , please verify your information",
  });
}
};

/***************************************************************  SIGNUP  *********************************************************************** */
async function signupStep1(req, res, next) {
  try {
    console.log("req.body.phone:", req.body.phone);
    const user = await User.findOne({ phone: req.body.phone });
    if (user) {
      return res.status(409).json({
        error: 'This phone number has already been used',
      });
    }
    res.locals.phone = req.body.phone;
    console.log("res.locals.phone:", res.locals.phone);
    next();
  } catch (e) {
    console.log("step1 error: ", e.message);
    res.status(400).json({
      error: "An error has occurred, please verify your information",
    });
  }
}

async function signupStep2(req, res, next) {
  try {
    const { name,age,email,description,gender } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(409).json({
        error: 'This email has already been used',
      });
    }
    const { error, value } = userStep1Validation({name,age,email,description,gender});
    if (error) {
      return res.status(400).json({ error: error.details[0].message.toString() });
    }
    res.locals.name = name;
    res.locals.age = age;
    res.locals.email = email;
    res.locals.description = description;
    res.locals.gender = gender;
    next();
  } catch (e) {
    console.log("e.message");
    console.log(e.message);
    res.status(400).json({
      error: "An error has occurred, please verify your information",
    });
  }
}

async function signupStep3(req, res, next) {
  try {
    const { seriousRelationship,haveKids,wantKids,degree,religion,origin } = req.body;
    const { error, value } = userStep2Validation({ seriousRelationship,haveKids,wantKids,degree,religion,origin });
    if (error) {
      return res.status(400).json({ error: error.details[0].message.toString() });
    }
    res.locals.seriousRelationship = seriousRelationship;
    res.locals.haveKids = haveKids;
    res.locals.wantKids = wantKids;
    res.locals.degree = degree;
    res.locals.religion = religion;
    res.locals.origin = origin;
    next();
  } catch (e) {
    console.log(e.message);
    res.status(400).json({
      error: "An error has occurred, please verify your information",
    });
  }
}

async function signup(req, res, next) {
  try {
  const {
    name,
    age,
    phone,
    email,
    description,
    gender,
    seriousRelationship,
    haveKids,
    wantKids,
    degree,
    religion,
    origin,
    interests,
    location,
  } = req.body;

  const users = await User.find();
  // Validate the request body against the schema
  const { error, value } = userValidation(req.body);
 
  if (error) {
    console.log('error ====================================');
    console.log(error);
    console.log('====================================');
    return res.status(400).json({ error: error.details[0].message.toString() });
  }

 // Images verification
 let gallery = [];
 if (req.files.length == 0 || req.files == null || req.files.length < 2) {
   return res.status(400).json({ error: "Please upload 2 pictures minimum" });
 } else if (req.files) {
   gallery = req.files.map((file) => file.path);
 }
  
  if (users.find((person) => person.phone == phone)!=undefined && users.find((person) => person.phone == phone)!=null) {
  return res.status(409).send("This phone number has already been used");
 }
  if (users.find((person) => person.email == email)!=undefined&& users.find((person) => person.email == email)!=null) {
  return res.status(409).send("This email has already been used");
}
  const newUser = await User.create({
    name,
    age,
    phone,
    email,
    description,
    gender,
    seriousRelationship,
    haveKids,
    wantKids,
    degree,
    religion,
    origin,
    interests,
    location,
    gallery,
  });
  console.log('newUser====================================');
  console.log(newUser);
  console.log('====================================');
  // Create a refresh token and save it
  const refreshTokenDoc = RefreshToken({
    owner: newUser.id
  });
  await refreshTokenDoc.save();

  // Generate tokens
  const refreshToken = createRefreshToken(newUser.id, refreshTokenDoc.id);
  const accessToken = createAccessToken(newUser.id);

  next();

  return res.status(200).json({
    user: newUser,
    accessToken,
    refreshToken
  });
  
}catch(e){
  res.status(400).json({
    error: e.message,
  });
}
}

async function signupFinalStep(req, res, next) {
  try {
    const {
      name,
      age,
      phone,
      email,
      description,
      gender,
      seriousRelationship,
      haveKids,
      wantKids,
      degree,
      religion,
      origin,
      interests,
      location,
    } = req.body;
 // Images verification
 let gallery = [];
 if (req.files.length == 0 || req.files == null || req.files.length < 2) {
   return res.status(400).json({ error: "Please upload 2 pictures minimum" });
 } else if (req.files) {
   gallery = req.files.map((file) => file.path);
 }

  const newUser = await User.create({
    name,
    age,
    phone,
    email,
    description,
    gender,
    seriousRelationship,
    haveKids,
    wantKids,
    degree,
    religion,
    origin,
    interests,
    location,
    gallery,
  });
  console.log('newUser====================================');
  console.log(newUser);
  console.log('====================================');
  // Create a refresh token and save it
  const refreshTokenDoc = RefreshToken({
    owner: newUser.id
  });
  await refreshTokenDoc.save();

  // Generate tokens
  const refreshToken = createRefreshToken(newUser.id, refreshTokenDoc.id);
  const accessToken = createAccessToken(newUser.id);

  return res.status(200).json({
    user: newUser,
    accessToken,
    refreshToken
  });
  
}catch(e){
  res.status(400).json({
    error: e.message,
  });
}
}


/***************************************************************  NEW REFRESH TOKEN  *********************************************************************** */

const newRefreshToken = errorHandler(async (req, res, next) => {
  const currentRefreshToken = await validateRefreshToken(req.body.refreshToken);
  const refreshTokenDoc = RefreshToken({
      owner: currentRefreshToken.userId
  });

  await refreshTokenDoc.save();
  await RefreshToken.deleteOne({_id: currentRefreshToken.tokenId});

  const refreshToken = createRefreshToken(currentRefreshToken.userId, refreshTokenDoc.id);
  const accessToken = createAccessToken(currentRefreshToken.userId);

  return {
      id: currentRefreshToken.userId,
      accessToken,
      refreshToken
  };
});

/***************************************************************  NEW ACCESS TOKEN  *********************************************************************** */

const newAccessToken = errorHandler(async (req, res) => {
  const refreshToken = await validateRefreshToken(req.body.refreshToken);
  const accessToken = createAccessToken(refreshToken.userId);

  return {
      id: refreshToken.userId,
      accessToken,

      refreshToken: req.body.refreshToken
  };
});

/***************************************************************  LOGOUT  *********************************************************************** */

const logout = errorHandler(async (req, res, next) => {
  const refreshToken = await validateRefreshToken(req.body.refreshToken);
  await RefreshToken.deleteOne({_id: refreshToken.tokenId});
  return {success: true};
});

/***************************************************************  LOGOUT ALL  *********************************************************************** */

const logoutAll = errorHandler(async (req, res, next) => {
  const refreshToken = await validateRefreshToken(req.body.refreshToken);
  await RefreshToken.deleteMany({owner: refreshToken.userId});
  return {success: true};
});

/***************************************************************  VALIDATE REFRESH TOKEN  *********************************************************************** */

const validateRefreshToken = async (token) => {
  const decodeToken = () => {
      try {
          return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch(err) {
          // err
          return new HttpError(401, 'Unauthorised').toJSON();
      }
  }

  const decodedToken = decodeToken();
  const tokenExists = await RefreshToken.exists({_id: decodedToken.tokenId, owner: decodedToken.userId});
  if (tokenExists) {
      return decodedToken;
  } else {
    return new HttpError(401, 'Unauthorised').toJSON();
  }
};



module.exports = {signinStep1,signupStep1,signupStep2,signupStep3,isPhoneVerified,signupFinalStep,signup,newRefreshToken,newAccessToken,logout,logoutAll,sendVerificationCode,verifyOTP,signinStep2,registerPhoneVerification};
