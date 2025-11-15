import { useEffect, useRef } from 'react'

interface DeckMenuProps {
  x: number
  y: number
  onDraw: () => void
  onShuffle: () => void
  onClose: () => void
}

export default function DeckMenu({ x, y, onDraw, onShuffle, onClose }: DeckMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="fixed bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-purple-500/60 rounded-lg shadow-2xl z-50 overflow-hidden"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      <button
        onClick={() => {
          onDraw()
          onClose()
        }}
        className="block w-full text-left px-4 py-3 text-white hover:bg-purple-600/50 font-bold border-b border-gray-700/50 transition-all hover:pl-6"
      >
        📥 Draw Card
      </button>
      <button
        onClick={() => {
          onShuffle()
          onClose()
        }}
        className="block w-full text-left px-4 py-3 text-white hover:bg-purple-600/50 font-bold transition-all hover:pl-6"
      >
        🔀 Shuffle Deck
      </button>
    </div>
  )
}
