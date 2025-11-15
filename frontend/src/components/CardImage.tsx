interface CardImageProps {
  card: {
    id: string
    name: string
    imageUrl?: string
    type: string
    power?: number
    toughness?: number
  }
  faceDown?: boolean
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onClick?: () => void
}

export default function CardImage({
  card,
  faceDown = false,
  draggable = false,
  onDragStart,
  onClick,
}: CardImageProps) {
  if (faceDown) {
    return (
      <div
        className="w-24 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg border-2 border-gray-600 cursor-default flex items-center justify-center shadow-lg"
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-white font-bold text-xs">MTG</div>
          <div className="text-gray-300 text-xs">Card</div>
        </div>
      </div>
    )
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`relative w-24 h-32 rounded-lg overflow-hidden border-2 border-yellow-600 shadow-lg transform transition-transform ${
        draggable ? 'cursor-grab hover:scale-105 active:cursor-grabbing' : ''
      }`}
    >
      {card.imageUrl ? (
        <>
          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10"></div>
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-purple-600 to-purple-900 p-1 flex flex-col text-xs text-white">
          <div className="font-bold truncate">{card.name}</div>
          <div className="text-gray-200 text-xs mb-1">{card.type}</div>
          {card.power && card.toughness && (
            <div className="mt-auto text-right font-bold">{card.power}/{card.toughness}</div>
          )}
        </div>
      )}
    </div>
  )
}
