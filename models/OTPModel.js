const mongoose = require('mongoose');
const { Schema, model} = mongoose;

const OTPSchema = new Schema({
      sid: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      code: {
        type: String,
        required: true,
      },
      verified: {
        type: Boolean,
        required: false,
        default:false,
      },
});

const OTPModal = model('OTPModel', OTPSchema);

module.exports = { OTPModel: OTPModal };