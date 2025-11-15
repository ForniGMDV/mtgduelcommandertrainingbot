interface StackedDeckProps {
  cardCount: number
  faceDown?: boolean
}

export default function StackedDeck({ cardCount, faceDown = true }: StackedDeckProps) {
  return (
    <div className="relative w-24 h-32 cursor-pointer hover:scale-105 transition-transform">
      {Array(Math.min(cardCount, 5))
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`absolute w-24 h-32 rounded-lg border-2 ${
              faceDown
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-gray-600'
                : 'bg-gradient-to-b from-purple-600 to-purple-900 border-yellow-600'
            } shadow-lg`}
            style={{
              transform: `translateY(${i * 2}px) translateX(${i * 1.5}px) rotateZ(${i * 1}deg)`,
              zIndex: i,
            }}
          >
            {faceDown && (
              <div className="flex items-center justify-center w-full h-full">
                <div className="text-center">
                  <div className="text-white font-bold text-xs">MTG</div>
                  <div className="text-gray-300 text-xs">Card</div>
                </div>
              </div>
            )}
          </div>
        ))}

      {cardCount > 5 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
          {cardCount}
        </div>
      )}
    </div>
  )
}
