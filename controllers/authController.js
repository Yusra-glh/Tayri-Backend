const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const { GenderEnum } = require("../models/genderEnum");
const { RefreshToken } = require("../models/refreshTokenModel");
const { Degrees, Religions, Origins, Interests } = require("../util/localData");
const {errorHandler, withTransaction} = require("../util/util");
const HttpError = require("../util/HttpError");

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

const signin = errorHandler(async (req, res, next) => {
  const { phone } = req.body;
    const user = await User.findOne({phone });
    if (!user) {
      return new HttpError(401, 'Wrong username or password').toJSON();
      
    }
  const refreshTokenDoc = RefreshToken({
      owner: user.id
  });

  await refreshTokenDoc.save();

  const refreshToken = createRefreshToken(user.id, refreshTokenDoc.id);
  const accessToken = createAccessToken(user.id);

  return {
      user: user,
      accessToken,
      refreshToken
  };
});

/***************************************************************  SIGNUP  *********************************************************************** */

const signup = errorHandler(async (req, res, next) => {
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
  // Images verification
  let gallery = [];
  if (req.files.length == 0 || req.files == null || req.files.length < 2) {
    return res.status(400).send("Please upload 2 pictures minimum");
  } else if (req.files) {
    gallery = req.files.map((file) => file.path);
  }
  //name verif
  else if (name == null || name == "") {
    return res.status(400).send("Please enter your name");
  }
  //age verif
  else if (age == null || age == "") {
    return res.status(400).send("Please enter your age");
  } else if (age < 18) {
    return res.status(400).send("Your age must be at least 18 years");
  }
  //phone verif
  else if (phone == null || phone == "") {
    return res.status(400).send("Please enter your phone number");
  } else if (users.find((person) => person.phone == phone)) {
    return res.status(409).send("This phone number has already been used");
  } else if (phone.length < 8) {
    return res.status(400).send("Invalid phone number");
  }
  //email verif
  else if (email == null || email == "") {
    return res.status(400).send("Please enter your email");
  } else if (!isEmailValid(email)) {
    return res.status(400).send("Invalid email address");
  } else if (users.find((person) => person.email == email)) {
    return res.status(409).send("This email has already been used");
  }
  //gender verif
  else if (gender == null || gender == "") {
    return res.status(400).send("Please enter your gender");
  } else if (!Object.values(GenderEnum).includes(gender)) {
    return res.status(400).send("Invalid gender");
  }
  //degree verif
  else if (degree != null && !Degrees.includes(degree)) {
    return res.status(400).send("Invalid degree type");
  }
  //religion verif
  else if (religion != null && !Religions.includes(religion)) {
    return res.status(400).send("Invalid religion");
  }
  //origin verif
  else if (origin != null && !Origins.includes(origin)) {
    return res.status(400).send("Invalid origin");
  }
  //interests verif
  else if (
    interests != null &&
    !interests.every((item) => Interests.includes(item))
  ) {
    return res.status(400).send("Invalid interests");
  }
  //location verif
  else if (location == null || location == "") {
    return res.status(400).send("Please enter your location");
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
  const refreshTokenDoc = RefreshToken({
      owner: newUser.id
  });

  await newUser.save();
  await refreshTokenDoc.save();

  const refreshToken = createRefreshToken(newUser.id, refreshTokenDoc.id);
  const accessToken = createAccessToken(newUser.id);

  return {
      user: newUser,
      accessToken,
      refreshToken
  };
});

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



module.exports = { signin,signup,newRefreshToken,newAccessToken,logout,logoutAll };
