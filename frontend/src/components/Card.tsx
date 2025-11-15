import { Card } from '../hooks/useGame'

interface CardProps {
  card: Card
  onClick?: () => void
  isClickable?: boolean
}

export default function Card({ card, onClick, isClickable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        w-24 h-32 bg-gradient-to-b from-purple-600 to-purple-900 rounded-lg p-2
        text-white text-xs border-2 border-purple-400 flex flex-col
        ${isClickable ? 'cursor-pointer hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105' : ''}
        transition-all duration-200
      `}
    >
      <div className="font-bold text-sm truncate">{card.name}</div>
      <div className="text-xs text-gray-300 mb-1">{card.type}</div>
      <div className="flex-1 text-xs overflow-hidden text-gray-200">{card.text}</div>
      {card.power && card.toughness && (
        <div className="mt-auto text-right font-bold">
          {card.power}/{card.toughness}
        </div>
      )}
      <div className="text-xs font-bold text-yellow-400">{card.manaCost}</div>
    </div>
  )
}
