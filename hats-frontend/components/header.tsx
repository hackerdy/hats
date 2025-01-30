import Image from "next/image"

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-yellow-400/20">
      <div className="flex items-center gap-2">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20250122-WA0018.jpg-zEjRlrSACDj6tobnGRF6twdnQCTKlI.jpeg"
          alt="Top Hat Logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <h1 className="text-xl font-bold text-yellow-400">Luxury Top Hat</h1>
      </div>
      <button className="p-2 rounded-full hover:bg-yellow-400/10 transition-colors">
        <MenuIcon className="w-6 h-6 text-yellow-400" />
      </button>
    </header>
  )
}

function MenuIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

