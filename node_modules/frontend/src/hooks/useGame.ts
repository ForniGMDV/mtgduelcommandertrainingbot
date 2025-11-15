import { useState, useCallback } from 'react'

export interface Card {
  id: string
  name: string
  manaCost: number
  type: string
  power?: number
  toughness?: number
  text: string
  imageUrl?: string
}

export interface PlayerState {
  id: string
  name: string
  life: number
  hand: Card[]
  battlefield: Card[]
  graveyard: Card[]
  library: Card[]
  commander: Card | null
}

export interface GameState {
  id: string
  player: PlayerState
  opponent: PlayerState
  currentPhase: string
  isPlayerTurn: boolean
  turn: number
  stack: Card[]
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startGame = useCallback(async (playerDeck?: Card[]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: playerDeck ? JSON.stringify({ playerDeck }) : undefined,
      })

      if (!response.ok) throw new Error('Failed to start game')
      const data = await response.json()
      setGameState(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const executeAction = useCallback(async (action: { type: string; cardId?: string; playerId?: string }) => {
    if (!gameState) {
      setError('No game active')
      return
    }

    try {
      const response = await fetch(`/api/games/${gameState.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })

      if (!response.ok) throw new Error('Action failed')
      const data = await response.json()
      setGameState(data)
      setError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      console.error(err)
    }
  }, [gameState])

  const playCard = useCallback((cardId: string) => {
    executeAction({ type: 'PlayCard', cardId })
  }, [executeAction])

  const drawCard = useCallback(() => {
    executeAction({ type: 'Draw', playerId: 'player_1' })
  }, [executeAction])

  const shuffleDeck = useCallback(() => {
    executeAction({ type: 'Shuffle', playerId: 'player_1' })
  }, [executeAction])

  const endTurn = useCallback(() => {
    executeAction({ type: 'EndTurn' })
  }, [executeAction])

  return {
    gameState,
    loading,
    error,
    startGame,
    playCard,
    drawCard,
    shuffleDeck,
    endTurn,
  }
}
