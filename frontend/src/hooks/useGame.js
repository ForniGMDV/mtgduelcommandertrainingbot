import { useState, useCallback } from 'react';
export function useGame() {
    const [gameState, setGameState] = useState(null);
    const [loading, setLoading] = useState(false);
    const startGame = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/games', { method: 'POST' });
            const data = await response.json();
            setGameState(data);
        }
        catch (error) {
            console.error('Failed to start game:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const playCard = useCallback(async (cardId) => {
        if (!gameState)
            return;
        try {
            const response = await fetch(`/api/games/${gameState.id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'PlayCard', cardId }),
            });
            const data = await response.json();
            setGameState(data);
        }
        catch (error) {
            console.error('Failed to play card:', error);
        }
    }, [gameState]);
    const endTurn = useCallback(async () => {
        if (!gameState)
            return;
        try {
            const response = await fetch(`/api/games/${gameState.id}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'EndTurn' }),
            });
            const data = await response.json();
            setGameState(data);
        }
        catch (error) {
            console.error('Failed to end turn:', error);
        }
    }, [gameState]);
    return {
        gameState,
        loading,
        startGame,
        playCard,
        endTurn,
    };
}
//# sourceMappingURL=useGame.js.map