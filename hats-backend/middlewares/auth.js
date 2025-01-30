// middlewares/auth.js


 import {validateTelegramHash}  from './telegramAuth.js'

 export const authMiddleware = async (req, res, next) => {
    try {
      const initData = req.headers['telegram-init-data'] || ''
      const botToken = process.env.BOT_TOKEN

      
  
      // Validate initData format
      if (!initData.includes('hash=')) {
        return res.status(401).json({ error: 'Invalid initData format' })
      }
  
      // Parse and validate hash
      const isValid = validateTelegramHash(initData, botToken)
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid Telegram hash' })
      }
  
      // Parse user data from initData
      const params = new URLSearchParams(initData)
      req.telegramUser = JSON.parse(params.get('user') || '{}')
      
      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      res.status(500).json({ error: 'Authentication system error' })
    }
  }