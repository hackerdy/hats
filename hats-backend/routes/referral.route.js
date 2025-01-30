import express from 'express';
import Referral from '../models/referral.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Middleware to validate Telegram ID
const validateTelegramId = (req, res, next) => {
  if (!req.body.telegramId) {
    return res.status(400).json({ message: 'Telegram ID is required' });
  }
  next();
};  

// Generate referral link using Telegram ID as code
router.post('/generate-link', validateTelegramId, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId: req.body.telegramId },
      { $setOnInsert: { referralCode: req.body.telegramId } },
      { upsert: true, new: true }
    );

    // Ensure referral code is set to Telegram ID
    if (user.referralCode !== user.telegramId) {
      user.referralCode = user.telegramId;
      await user.save();
    }

    res.json({ 
      referralLink: `https://t.me/${process.env.BOT_USERNAME}/club?start=${user.telegramId}` 
    });
  } catch (error) {
    console.error('Error generating referral link:', error);
    res.status(500).json({ 
      message: 'Error generating referral link', 
      error: error.message 
    }); 
  }
});
 
// Record referral with Telegram ID as code
router.post('/record-referral', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { referralCode, newUserTelegramId } = req.body;
     console.log(referralCode, newUserTelegramId);  
      // Validate input
      if (!referralCode || !newUserTelegramId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Prevent self-referral
      if (referralCode === newUserTelegramId) {
        return res.status(400).json({ message: 'Self-referral not allowed' });
      }

      const [referrer, referredUser] = await Promise.all([
        User.findOne({ telegramId: referralCode }).session(session), // Lookup by Telegram ID
        User.findOne({ telegramId: newUserTelegramId }).session(session)
      ]);

      if (!referrer || !referredUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (referredUser.referrer) {
        return res.status(409).json({ 
          message: 'User already has a referrer',
          alreadyReferred: true 
        });
      }

      const existingReferral = await Referral.findOne({
        referrer: referrer._id,
        referred: referredUser._id
      }).session(session);

      if (existingReferral) {
        return res.status(409).json({ 
          message: 'Referral already exists',
          alreadyReferred: true 
        });
      }

      // Create referral
      const newReferral = await Referral.create([{
        referrer: referrer._id,
        referred: referredUser._id,
        pointsEarned: 300,
        status: 'completed'
      }], { session });

      // Update users
      await Promise.all([
        User.findByIdAndUpdate(
          referrer._id,
          { 
            $inc: { balance: 300 },
            $push: { referrals: referredUser._id }
          },
          { session }
        ),
        User.findByIdAndUpdate(
          referredUser._id,
          { $set: { referrer: referrer._id } },
          { session }
        )
      ]);

      res.status(201).json({ 
        message: 'Referral recorded successfully',
        referral: newReferral[0] 
      });
    });
  } catch (error) {
    console.error('Error recording referral:', error);
    res.status(500).json({ 
      message: 'Error recording referral', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
});

// Get referral stats
router.get('/stats/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [referrals, activeUsers] = await Promise.all([
      Referral.find({ referrer: user._id })
        .populate('referred', 'firstName')
        .lean(),
      Referral.countDocuments({ 
        referrer: user._id, 
        status: 'completed' 
      })
    ]);

    const totalPoints = referrals.reduce((sum, ref) => sum + ref.pointsEarned, 0);

    res.json({
      stats: {
        totalReferrals: referrals.length,
        totalPoints: Number(totalPoints.toFixed(2)),
        activeUsers
      },
      referrals: referrals.map(ref => ({
        ...ref,
        pointsEarned: Number(ref.pointsEarned.toFixed(2))
      })),
      userBalance: user.balance
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ 
      message: 'Error fetching referral stats', 
      error: error.message 
    });
  }
});


// Update points for task completion
router.post('/update-points', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { telegramId, pointsEarned } = req.body;
    console.log('telegramId:', telegramId, 'pointsEarned:', pointsEarned);
    
    if (isNaN(pointsEarned) || typeof pointsEarned !== 'number') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid points value' });
    }

    const user = await User.findOne({ telegramId }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user has a referrer, update referrer's points
    if (user.referrer) {
      const referrerBonus = pointsEarned * 0.1; // 10% bonus
      console.log('Referrer bonus:', referrerBonus);
      const referrer = await User.findByIdAndUpdate(
        user.referrer,
        { $inc: { balance: referrerBonus } },
        { new: true, session, runValidators: true }
      );
      
      if (!referrer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Referrer not found' });
      }
      
      // Update the referral record
      await Referral.findOneAndUpdate(
        { referrer: user.referrer, referred: user._id },
        { $inc: { pointsEarned: referrerBonus } },
        { session, runValidators: true }
      );

      console.log(`Referrer bonus added: ${referrerBonus} points`);
    }

    await session.commitTransaction();
    session.endSession();
    
    res.json({ message: 'Referrer points updated successfully', userBalance: user.points });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating referrer points:', error);
    res.status(500).json({ message: 'Error updating referrer points', error: error.message });
  }
});



export default router;
