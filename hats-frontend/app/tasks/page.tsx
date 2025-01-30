"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ExternalLink } from "lucide-react"
import type { Task } from "@/lib/types"
import { useUser } from "@/context/UserContext"
import axios from "axios"
import WebApp from "@twa-dev/sdk"

interface EnhancedTask extends Task {
  method?: string
  url?: string
  verificationType?: string
}



export default function TasksPage() {
  const { user, refreshUser } = useUser()
  const [tasks, setTasks] = useState<EnhancedTask[]>([])
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initData = WebApp.initData;
     console.log(initData)
    const fetchTasks = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/task/user-tasks`,
          {
            telegramId: user?.telegramId
          },
          {
            headers: {
              'Authorization': `Bearer ${WebApp.initData}`,
              'Telegram-Init-Data': WebApp.initData
            }
          }
        )
        setTasks(response.data)
        
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
        WebApp.showAlert('Failed to load tasks. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (WebApp.initData) {
      fetchTasks()
    }
  }, [user?.telegramId])

  const handleTaskAction = async (task: EnhancedTask) => {
    console.log("Task clicked:", task); 
    try {
      setLoadingTaskId(task.id)
      
      if (!WebApp.initData) {
        WebApp.showAlert("Authentication expired. Please refresh the app.")
        return
      }

      if (task.method === "open_url" && task.url) {
        WebApp.openLink(task.url)
        await new Promise(resolve => setTimeout(resolve, 2000))
      } 
      console.log(task.taskId)
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/task/verify`,
        {
          task: task,
          telegramId: user?.telegramId
        },
        { 
          headers: {
            'Authorization': `Bearer ${WebApp.initData}`,
            'Telegram-Init-Data': WebApp.initData
          }
        } 
      )

      if (response.data.verified) {
        console.log(response.data)
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, completed: true } : t
        ))
        await refreshUser()
        WebApp.showAlert(`+${task.reward} $HATS earned! 🎉`)
      }
    } catch (error) {
      console.error("Task verification failed:", error)
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || "Verification failed. Please try again."
        : "Verification failed. Please try again."
      WebApp.showAlert(errorMessage)
    } finally {
      setLoadingTaskId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Earn HATS</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <Card key={index} className="border-gray-200 bg-black animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col p-4 max-w-md mx-auto bg-[#121212]">
      <h1 className="text-2xl font-bold text-white mb-4">Earn HATS</h1>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task._id} className="border-gray-800 bg-[#1A1A1A] rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700 rounded-t-xl">
              <CardTitle className="text-lg font-bold text-white">{task.title}</CardTitle>
              <span className="text-white font-bold">+{task.reward} HATS</span>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">{task.description}</p>
              <div className="flex gap-2">
                {task.url && (
                  <Button
                    onClick={() => WebApp.openLink(task.url!)}
                    className="flex-1 flex items-center justify-center bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Link
                  </Button>
                )}
                <Button
                  onClick={() => handleTaskAction(task)}
                  disabled={task.completed || !!loadingTaskId}
                  className={`flex-1 rounded-lg ${
                    task.completed
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-[#1A1A1A] hover:bg-[#2A2A2A]"
                  } text-white`}
                >
                  {task.completed ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Completed
                    </>
                  ) : (
                    <>
                      {loadingTaskId === task.id ? (
                        <span className="animate-pulse">Verifying...</span>
                      ) : (
                        <>
                          <Circle className="mr-2 h-4 w-4" /> Verify
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )

}