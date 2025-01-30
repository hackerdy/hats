import crypto from 'crypto'

// utils/telegramAuth.js
export const validateTelegramHash = (initData, botToken) => {
    try {
      const encoder = new TextEncoder()
      const dataToCheck = new URLSearchParams(initData)
      const receivedHash = dataToCheck.get('hash')
      
      // Validate required fields
      if (!receivedHash || !dataToCheck.get('user')) {
        return false
      }
  
      const secret = crypto.createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest()
  
      const checkString = Array.from(dataToCheck.entries())
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')
  
      const computedHash = crypto.createHmac('sha256', secret)
        .update(encoder.encode(checkString))
        .digest('hex')
  
      return computedHash === receivedHash
    } catch (error) {
      console.error('Hash validation error:', error)
      return false
    }
  }