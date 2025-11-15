import { useState } from 'react'

interface DeckImportProps {
  onImport: (cards: any[]) => void
  onClose: () => void
}

export default function DeckImport({ onImport, onClose }: DeckImportProps) {
  const [deckText, setDeckText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<any[]>([])

  const handleImport = async () => {
    if (!deckText.trim()) {
      setError('Please paste your deck list')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/decks/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckText }),
      })

      if (!response.ok) throw new Error('Failed to import deck')

      const data = await response.json()
      const allCards = [...data.cards]
      if (data.commander) allCards.push(data.commander)
      
      if (allCards.length < 99) {
        setError(`Need at least 99 cards. Got ${allCards.length}`)
        setLoading(false)
        return
      }

      setPreview(allCards)
    } catch (err) {
      setError('Failed to import deck')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (preview.length > 0) {
      onImport(preview)
    }
  }

  if (preview.length > 0) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg border border-purple-500 p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-4">Deck Preview ({preview.length})</h2>
          
          <div className="h-64 overflow-auto bg-gray-800 rounded p-4 mb-4">
            <div className="text-gray-300 text-sm">
              {preview.map((card, i) => (
                <div key={i} className={i === preview.length - 1 ? 'text-yellow-400 font-bold' : ''}>
                  {card.name} {i === preview.length - 1 && '(COMMANDER)'}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
            >
              Start Game
            </button>
            <button
              onClick={() => setPreview([])}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-purple-500 p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Import Deck</h2>

        <textarea
          value={deckText}
          onChange={(e) => setDeckText(e.target.value)}
          placeholder="Paste your 100-card deck list&#10;1 Card Name&#10;1 Another Card"
          className="w-full h-48 bg-gray-800 text-white p-4 rounded border border-gray-700 font-mono text-sm mb-4 resize-none focus:border-purple-500 outline-none"
        />

        {error && <div className="text-red-400 mb-4 text-sm">{error}</div>}

        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
          >
            {loading ? 'Importing...' : 'Import Deck'}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
