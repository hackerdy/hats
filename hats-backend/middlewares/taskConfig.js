// config/tasks.js
export const TASK_CONFIG = {
  'join-hats-telegram2': {
    reward: 100,
    verificationType: 'telegram_join',
    description: 'Join Telegram channel'
  },
  'join-telegram': {
    reward: 100,
    verificationType: 'telegram_join',
    description: 'Join Telegram channel'
  },
  'join-hats-telegram': {
    reward: 100,
    verificationType: 'telegram_join',
    description: 'Join Telegram channel'
  },
  'follow-twitter': {
    reward: 150,
    verificationType: 'twitter_follow',
    description: 'Follow Twitter account'
  },
  'retweet': {
    reward: 200,
    verificationType: 'twitter_retweet',
    description: 'Retweet pinned post'
  },
  'subscribe-youtube': {
    reward: 250,
    verificationType: 'youtube_subscribe',
    description: 'Subscribe to YouTube channel'
  },
  'watch-youtube': {
    reward: 300,
    verificationType: 'youtube_watch',
    description: 'Watch YouTube video'
  }
};