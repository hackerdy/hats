import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { TelegramUser, UserStats } from "@/lib/types"

interface UserProfileProps {
  user: TelegramUser

}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <Card className="border-gray-800 bg-[#121212] rounded-xl">
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="w-16 h-16 border-2 border-gray-700">
          <AvatarImage src={user.photo_url} alt={user.firstName} />
          <AvatarFallback className="bg-gray-800 text-gray-400">
            {user.firstName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-bold text-white">
            {user.username ? `@${user.username}` : user.firstName}
          </h2>
          <p className="text-gray-400">Top Hat Holder 🎩✨</p>
        </div>
      </CardContent>
    </Card>
  );  
}

