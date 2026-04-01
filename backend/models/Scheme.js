const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    photo: { type: String }, // Base64 encoded or URL
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scheme', SchemeSchema);
