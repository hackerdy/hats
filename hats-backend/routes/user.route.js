import express from 'express';
import crypto from 'crypto';
import { parse } from 'querystring'; // Import querystring
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { authMiddleware } from '../middlewares/auth.js';
const router = express.Router();
dotenv.config();
import { Bot, InlineKeyboard } from 'grammy';



const BOT_TOKEN = process.env.BOT_TOKEN;

async function validateTelegramData(req, res) {
    try {
      const initData = req.body.initData;
      
      if (!initData) {
        return res.status(400).json({ error: 'initData is required' });
      } 
      const parsedInitData = new URLSearchParams(initData);
      const hash = parsedInitData.get('hash');
      parsedInitData.delete('hash');
  
      // Sort keys manually
      const sortedKeys = Array.from(parsedInitData.keys()).sort();
      let dataCheckString = '';
      for (const key of sortedKeys) {
        dataCheckString += `${key}=${parsedInitData.get(key)}\n`;
      }
      dataCheckString = dataCheckString.slice(0, -1);
  
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  

    
      if (calculatedHash !== hash) {
        return res.status(400).json({ error: 'Invalid initData hash' });
      }
  
      const MAX_AUTH_AGE = 24 * 60 * 60; // 24 hours in seconds
  const WARN_AUTH_AGE = 23 * 60 * 60; // 23 hours in seconds
  
  const authDate = parseInt(parsedInitData.get('auth_date'), 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const authAge = currentTime - authDate;
  
  if (authAge > MAX_AUTH_AGE) {
    return res.status(401).json({
      error: 'Authentication Expired',
      message: 'Your session has expired. Please restart the app.',
      code: 'AUTH_EXPIRED'
    });
  } else if (authAge > WARN_AUTH_AGE) {
    console.warn(`Auth data nearing expiration. Age: ${authAge} seconds`);
    // Optionally, you can add a warning to the response
    res.set('X-Auth-Expiring-Soon', 'true');
  }
  
  // If we reach here, the auth is still valid
  console.log(`Auth age: ${authAge} seconds`);
  
  
      const userObj = JSON.parse(parsedInitData.get('user'));
      if (userObj.is_bot) {
        return res.status(400).json({ error: 'Bots are not allowed' });
      } 
  
      const telegramId = userObj.id;
      const isPremium = userObj.is_premium;
  
  
      try {
        let user = await User.findOne({telegramId});
  
        if (!user) {
          user = new User({
            telegramId: telegramId,
            premium: isPremium || false,
            balance: isPremium ? 4000 : 3500,
            firstName: userObj.first_name,
          });
        } else {
          if (!user.premium && isPremium) {
            user.premium = isPremium;
            user.balance += 500;
          }
        }
  
        await user.save();
         // Create a response object with user data
      const responseData = {
        message: 'User created/updated successfully',
        user: {
          telegramId: user.telegramId,
          premium: user.premium,
          balance: user.balance.toFixed(2),
          firstName: userObj.first_name,
          lastName: userObj.last_name,
          username: userObj.username,
          photoUrl: userObj.photo_url,
          referrals: user.referrals.length,
          loginStreak: user.loginStreak,
          lastLogin: user.lastLogin,
          streakRewards: user.streakRewards

        }
      };
  
      return res.json(responseData);
        return res.json({ message: 'User created/updated successfully', user });
      } catch (dbError) {
        console.error('Database error while saving user:', dbError);
        return res.status(500).json({ error: 'Database error', details: dbError.message });
      }
    } catch (error) {
      console.error('Error validating Telegram data:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
 
// routes/user.js
// routes/user.js
router.post('/update-login-streak', authMiddleware, async (req, res) => {
  try {
    const { telegramId } = req.body;
    const user = await User.findOne({ telegramId });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const lastLogin = user.lastLogin ? 
      new Date(Date.UTC(
        user.lastLogin.getUTCFullYear(),
        user.lastLogin.getUTCMonth(),
        user.lastLogin.getUTCDate()
      )) : null;

    // Check if already logged in today
    if (lastLogin && lastLogin.getTime() === today.getTime()) {
      return res.status(400).json({ 
        error: 'Already claimed today',
        streak: user.loginStreak,
        streakRewards: user.streakRewards
      });
    }

    const dayDifference = lastLogin ? 
      Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24)) : 0;

    let newStreak = user.loginStreak;
    let reward = 0;

    if (dayDifference === 1) {
      newStreak = user.loginStreak + 1;
    } else if (dayDifference > 1 || !lastLogin) {
      newStreak = 1;
    }

    // Calculate rewards only if streak updated
    if (newStreak !== user.loginStreak) {
      const dailyReward = 10;
      const weeklyBonus = 100;
      reward = dailyReward;

      if (newStreak % 7 === 0) {
        reward += weeklyBonus;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        loginStreak: newStreak,
        lastLogin: now,
        streakRewards: user.streakRewards + reward,
        $inc: { balance: reward }
      },
      { new: true }
    );

    res.json({
      streak: updatedUser.loginStreak,
      lastLogin: updatedUser.lastLogin,
      streakRewards: updatedUser.streakRewards,
      dailyReward: reward
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const bot = new Bot(process.env.BOT_TOKEN);

const createKeyboard = () => {
  return new InlineKeyboard()
    .url('Open App', 'https://t.me/hats_appbot/club')
    .row()
    .url('Follow Twitter Club', 'https://x.com/the_hatsclub')
    .row()
    .url('Join Telegram Channel', 'https://t.me/hats_club');
};


bot.on('my_chat_member', async (ctx) => {
  if (ctx.myChatMember.new_chat_member.status === 'member') {
    await ctx.reply(
      'Welcome to the Hats club! Join our channel and follow us:',
      { reply_markup: createKeyboard() }
    );
  } else {
    await ctx.reply('Welcome to Telegram Referral Hub! Please join our channel and follow us:', {
      reply_markup: createKeyboard(),
    });
  }
});

bot.on('message', async (ctx) => {
  await ctx.reply(
    'Welcome! Please join our Telegram channel and follow us on Twitter:',
    { reply_markup: createKeyboard() }
  );
});



bot.command('start', async (ctx) => {
  await ctx.reply(
    'Welcome! Please join our Telegram channel and follow us on Twitter:',
    { reply_markup: createKeyboard() }
  );
});

bot.start();

  router.post('/validate-telegram-data', validateTelegramData); // Associate the handler with the route

export default router; // Export the router