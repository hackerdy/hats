import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tgUsername: {
    type: String,
  },
  reward: {
    type: Number,
    required: true
  },
  verificationType: {
    type: String,
    enum: ['telegram_channel','telegram_group', 'twitter_follow', 'twitter_retweet', 'youtube_subscribe', 'youtube_watch'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['open_url'],
    default: 'open_url'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.model('Task', taskSchema);
export default Task;