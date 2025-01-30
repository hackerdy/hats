export interface TelegramUser {
  id: number
  firstName: string
  username?: string
  photo_url?: string
  balance: number
  telegramId: number
  referrals: Array<TelegramUser>
  lastLogin: string;
  loginStreak: number
  streakRewards: number;
  refreshUser: () => void;
  completedTasks: string[]; 
}

export interface UserStats {
  balance: number
  invitedCount: number
  isEligible: boolean
  loginStreak: number
  lastLogin: string // ISO date string
  streakRewards: number // Total $HATS earned from streak
  
}

export interface Task {
  taskId: string
  _id: string
  id: string
  title: string
  description: string
  reward: number
  completed: boolean
}

export interface StreakReward {
  day: number
  reward: number
  loginStreak: number,
  lastLogin: Date,
  streakRewards: number
  
}

