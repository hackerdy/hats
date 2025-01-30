import Link from "next/link"
import { Home, Award, User } from "lucide-react"

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-200 p-2">
      <div className="flex justify-around items-center">
        <NavButton href="/" icon={<Home className="w-6 h-6" />} label="Home" />
        <NavButton href="/tasks" icon={<Award className="w-6 h-6" />} label="Tasks" />
        <NavButton href="/profile" icon={<User className="w-6 h-6" />} label="Profile" />
      </div>
    </nav>
  )
}

function NavButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center text-gray-600 hover:text-white">
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
}

