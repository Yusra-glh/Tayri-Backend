const { User } = require("../models/userModel");
const { GenderEnum } = require("../models/genderEnum");
const { Degrees, Religions, Origins, Interests } = require("../util/localData");
const HttpError = require('../util/HttpError');
const {errorHandler} = require("../util/util");

/***************************************************************  GET USER BY ID  *********************************************************************** */

const getUserById = errorHandler(async (req, res) => {
  const { userId } = req.params; 
  const userDoc = await User.findById(userId).exec();
  if (!userDoc) {
    return new HttpError(400, 'User not found').toJSON();
  }
  return userDoc;
});

/***************************************************************  GET ALL USERS  *********************************************************************** */

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();
    if (users.length === 0) return res.send("No users");
    res.send(users);
  } catch (err) {
    res.sendStatus(400);
  }
}


async function updateWard(req, res, next) {
  try {
    const oldUser = await User.updateOne({ name: "wared" }, { age: 200 });
    res.send(oldUser);
  } catch (err) {
    res.sendStatus(400);
  }
}
async function deleteWard(req, res, next) {
  try {
    const oldUser = await User.delete({ name: "wared" });
    res.send(oldUser);
  } catch (err) {
    res.sendStatus(400);
  }
}

module.exports = { getAllUsers, updateWard, deleteWard,getUserById };
