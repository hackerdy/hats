// routes/task.js
import express from 'express';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { authMiddleware } from '../middlewares/auth.js';
import mongoose from 'mongoose';
import {TASK_CONFIG} from '../middlewares/taskConfig.js';
import Task from '../models/task.model.js';
const router = express.Router();
dotenv.config();



// Get all active tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ active: true });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks with user completion status
router.post('/user-tasks', authMiddleware, async (req, res) => {
  try {
    const telegramId = req.telegramUser?.id;
    
    if (!telegramId) {
      return res.status(400).json({
        error: "Missing user identification",
        message: "Authentication data incomplete"
      });
    }

    const [tasks, user] = await Promise.all([
      Task.find({ active: true }).lean(),
      User.findOne({ telegramId }).select('completedTasks')
    ]);

    const completedTaskIds = user?.completedTasks?.map(t => t.taskId) || [];

    // Split tasks into incomplete and completed groups
    const tasksWithStatus = tasks.reduce((acc, task) => {
      const isCompleted = completedTaskIds.includes(task.taskId);
      isCompleted ? acc.completed.push(task) : acc.incomplete.push(task);
      return acc;
    }, { incomplete: [], completed: [] });

    // Maintain original order for both groups, with completed last
    const sortedTasks = [
      ...tasksWithStatus.incomplete.map(t => ({ ...t, completed: false })),
      ...tasksWithStatus.completed.map(t => ({ ...t, completed: true }))
    ];

    return res.json(sortedTasks);

  } catch (error) {
    console.error('User tasks error:', {
      error: error.message,
      stack: error.stack,
      userId: req.telegramUser?.id
    });
    
    return res.status(500).json({
      error: "Task retrieval failed",
      message: "Could not fetch user tasks",
      code: "TASKS_FETCH_ERROR"
    });
  }
});

// Create new task (admin endpoint)
router.post('/0155', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});  

// Update task (admin endpoint)
router.patch('/:taskId', async (req, res) => {
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { taskId: req.params.taskId },
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.post('/verify', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Destructure the task from req.body
    const { task } = req.body; // <-- Changed this line
    const telegramId = req.telegramUser.id;

    // Add null checks
    if (!task) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Task object is required" });
    }

    const taskId = task.taskId;
    const task_id = task._id;
    const taskReward = task.reward;
    const verificationType = task.verificationType; 
    const tgUsername = task.tgUsername;

    console.log(task); // Debug log

    console.log('Verification Type:', verificationType); // Debug log

    // Check existing completion
    const user = await User.findOne({ telegramId }).session(session);
    if (user.completedTasks.includes(task_id)) {
      await session.abortTransaction();
      return res.json({ verified: true });
    }

    // Task-specific verification
    let verified = false;
    switch(verificationType) {
      case 'telegram_channel':
        verified = await verifyTelegramMembership(telegramId, tgUsername);
        break;
      case 'telegram_group':
        verified = await verifygroupMembership(telegramId, tgUsername);
        break;
      case 'follow-twitter':
      case 'retweet':
        // Placeholder for future implementations
        verified = true;  // Auto-approve until implemented
        console.warn(`Verification type not implemented: ${verificationType}`);
        break;
      default:
        // Auto-verify any other task types
        verified = true;
        console.log(`Auto-verified task type: ${verificationType}`);
    }

    if (!verified) {
      await session.abortTransaction();
      return res.json({ verified: false });
    }


   

    // Update user
    await User.findByIdAndUpdate(
      user._id,
      {
        $addToSet: { completedTasks: task },
        $inc: { balance: taskReward }
      },
      { session }
    );

    await session.commitTransaction();
    res.json({ verified: true });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
});
  
  // Example Telegram verification
  export const verifyTelegramMembership = async (telegramId, tgUsername) => {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgUsername,
            user_id: telegramId
          })
        } 
      );
      
      const data = await response.json();
      console.log(data);
      return ['member', 'administrator', 'creator'].includes(data.result?.status);
      
    } catch (error) {
      console.error('Telegram verification failed:', error);
      return false;
    } 
  };

  export const verifygroupMembership = async (telegramId, tgUsername) => {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
        {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: tgUsername,
            user_id: telegramId
          })
        } 
      );
      
      const data = await response.json();
      console.log(data);
      return ['member', 'administrator', 'creator'].includes(data.result?.status);
      
    } catch (error) {
      console.error('Telegram verification failed:', error);
      return false;
    } 
  };
 
  
    export default router;