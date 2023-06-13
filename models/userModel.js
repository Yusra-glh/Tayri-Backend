const mongoose = require("mongoose");
const {GenderEnum} = require('./genderEnum');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: Object.values(GenderEnum),
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  description: {
    type: String,
    default: "",
  },
  seriousRelationship:{
    type: Boolean,
    default: false,
  },
  haveKids:{
    type: Boolean,
    default: false,
  },
  wantKids:{
    type: Boolean,
    default: false,
  },
  degree:{
    type: String,
    default: "",
  },
  religion:{
    type: String,
    default: "",
  },
  origin:{
    type: String,
    default: "",
  },
  interests: {
    type: [String],
    default: [],
  },
  gallery:{
    type: [String],
    default: [],
    required:true
  }

});


module.exports = { User: mongoose.model("users", userSchema), GenderEnum };
