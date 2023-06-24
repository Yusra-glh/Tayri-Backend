const mongoose = require("mongoose");
const {GenderEnum} = require('./genderEnum');
const Joi = require('joi');
const { Degrees, Religions, Origins, Interests } = require("../util/localData");

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
     // required: true,
    },
    lng: {
      type: Number,
      //required: true,
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
  },
  //used coupons, matches,likes,dislikes,coupons

});
function userValidation(data) {

  const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(18).required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  description: Joi.string(),
  gender: Joi.string().valid(...Object.values(GenderEnum)).required(),
  seriousRelationship: Joi.boolean(),
  haveKids: Joi.boolean(),
  wantKids: Joi.boolean(),
  degree: Joi.string(), 
  religion: Joi.string().valid(...Religions), 
  origin: Joi.string().valid(...Origins),
  interests: Joi.array().items(Joi.string().valid(...Interests)).default([]),
  location: Joi.object({
    lat: Joi.number(),
    lng: Joi.number(),
  }),
  gallery: Joi.array().min(2),
});
return schema.validate(data);

}
function userStep1Validation(data) {
  const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().min(18).required(),
  email: Joi.string().email().required(),
  description: Joi.string(),
  gender: Joi.string().valid(...Object.values(GenderEnum)).required(),
});
return schema.validate(data);
}

function userStep2Validation(data) {
  const schema = Joi.object({
    seriousRelationship: Joi.boolean(),
    haveKids: Joi.boolean(),
    wantKids: Joi.boolean(),
    degree: Joi.string(), 
    religion: Joi.string().valid(...Religions), 
    origin: Joi.string().valid(...Origins),
});
return schema.validate(data);

}
module.exports = { User: mongoose.model("users", userSchema),userValidation,userStep1Validation,userStep2Validation };
