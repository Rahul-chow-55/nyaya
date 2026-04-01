const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  pay: { type: String, required: true },
  type: { type: String, required: true }, // e.g. Daily Wage, Seasonal, Permanent
  targetRole: { type: String, required: true }, // e.g. Labour, Security, Delivery
  description: { type: String },
  limit: { type: Number, default: 1 }, // Max number of workers allowed
  applicants: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, required: true, default: 'N/A' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
  }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
