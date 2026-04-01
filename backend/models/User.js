const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    required: false,
    sparse: true
  },
  picture: {
    type: String
  },
    role: {
    type: String,
    enum: ['client', 'employee', 'admin', 'worker', 'employer'],
    default: 'client'
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
