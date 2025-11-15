import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-purple-400 mb-4">
            Magic: The Gathering
          </h1>
          <p className="text-2xl text-gray-300">Duel Commander vs AI</p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Play Game */}
          <Link to="/play" className="group">
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-lg p-8 hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105">
              <div className="text-4xl mb-4">⚔️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Play Game</h2>
              <p className="text-gray-200">Challenge the AI in a Duel Commander match</p>
            </div>
          </Link>

          {/* Deck Builder */}
          <Link to="/deck-builder" className="group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg p-8 hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105">
              <div className="text-4xl mb-4">🎴</div>
              <h2 className="text-2xl font-bold text-white mb-2">Deck Builder</h2>
              <p className="text-gray-200">Create and customize your deck</p>
            </div>
          </Link>

          {/* Statistics */}
          <Link to="/stats" className="group">
            <div className="bg-gradient-to-br from-orange-600 to-orange-900 rounded-lg p-8 hover:shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-white mb-2">Statistics</h2>
              <p className="text-gray-200">View AI progress and game stats</p>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-gray-800 rounded-lg p-8 border border-purple-500/30">
          <h3 className="text-2xl font-bold text-white mb-4">Welcome to MTG Bot</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✓ Play complete Duel Commander format matches</li>
            <li>✓ Train the AI through self-play simulations</li>
            <li>✓ Build and manage your decks</li>
            <li>✓ Track your wins and losses</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
