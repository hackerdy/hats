// user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative'],
    },
    premium: {
      type: Boolean,
      default: false,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    referrals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    loginStreak: {
      type: Number,
      default: 0,
      min: 0
    }, 
    lastLogin: {
      type: Date,
      default: null
    },
    streakRewards: {
      type: Number,
      default: 0,
      min: 0
    },
    completedTasks: [{
      taskId: {
        type: String,
        required: true
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      reward: {
        type: Number,
        required: true
      }
    }],
  }, 
  {
    timestamps: true,
  }
);



const User = mongoose.model('User', userSchema);
export default User;