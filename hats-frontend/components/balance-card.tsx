import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TelegramUser, UserStats } from "@/lib/types"

interface BalanceCardProps {

  user: TelegramUser
}

export function BalanceCard({  user }: BalanceCardProps) {
  return (
    <Card className="border-gray-800 bg-[#121212] overflow-hidden rounded-xl">
      <CardHeader className="bg-[#1A1A1A] border-b border-gray-700 rounded-t-xl">
        <CardTitle className="text-center text-white">Your HATS Balance</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center">
          <span className="text-4xl font-bold text-white">{user.balance}</span>
          <span className="text-gray-400 ml-2">HATS</span>
        </div>
        <div className="mt-4 text-center text-gray-400 text-sm">The most elegant token in the game 🎩</div>
      </CardContent>
    </Card>
  )
}

