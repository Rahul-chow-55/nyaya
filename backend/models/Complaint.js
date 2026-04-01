const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  trackId: { type: String, required: true, unique: true },
  status: { type: String, default: 'Pending' }, // Pending, In Process, Resolved
  photo: { type: String }, // Base64 image
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
