'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import WebApp from "@twa-dev/sdk"
import axios from 'axios'
import { useUser } from '@/context/UserContext'

export function InviteSystem() {
  const [isSharing, setIsSharing] = useState(false)
  const REQUIRED_REFERRALS = 3 // Set your required referral count
  const { user } = useUser()
  
  const handleShare = async () => {
    try {
      setIsSharing(true)
      const webApp = WebApp

      // Generate referral link
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/referral/generate-link`, {
        telegramId: user?.telegramId
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      const { referralLink } = response.data

      // Telegram share functionality
      if (webApp?.isVersionAtLeast('6.1')) {
        // Use openTelegramLink as a fallback
        const text = `Join me in the HATS club! 🎩`
        webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`)
      } else {
        // Fallback to copy to clipboard
        await navigator.clipboard.writeText(referralLink)
        alert('Referral link copied to clipboard! 📋')
      }
    } catch (error) {
      console.error('Sharing failed:', error)
      alert('Failed to share. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }
  
  console.log(user)
  const progressWidth = user && typeof user.referrals === 'number' 
    ? Math.min((user.referrals / REQUIRED_REFERRALS) * 100, 100)
    : 0

    return ( 
      <Card className="border-gray-800 bg-[#121212] rounded-xl overflow-hidden">
        <CardHeader className="bg-[#1A1A1A] border-b border-gray-700 rounded-t-xl">
          <CardTitle className="text-center text-white">Airdrop Mission 🎁</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Frens Invited:</span>
              <span className="text-white font-bold">{typeof user?.referrals === 'number' ? user.referrals : 0}/{REQUIRED_REFERRALS}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5A5A5A] transition-all duration-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
  
          <div className="text-center text-sm space-y-2">
            {(typeof user?.referrals === 'number' && user.referrals < REQUIRED_REFERRALS) ? (
              <p className="text-gray-400">
                Invite {REQUIRED_REFERRALS - (typeof user?.referrals === 'number' ? user.referrals : 0)} more frens for the HATS airdrop! 🎩
              </p>
            ) : (
              <p className="text-green-500">
                Congratulations! You&apos;re eligible! Invite more frens for extra rewards! 🎉
              </p>
            )}
          </div>
  
          <Button 
            onClick={handleShare} 
            disabled={isSharing}
            className="w-full bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] rounded-lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isSharing ? 'Generating Link...' : 'Invite Frens'}
          </Button>
        </CardContent>
      </Card>
    )

  }
  