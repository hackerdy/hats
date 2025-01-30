// referral.model.js
import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Unique compound index to prevent duplicate referrals
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;