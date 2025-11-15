import { Router } from 'express';
import { createGame, getGameState, playCard, endTurn, drawCard, shuffleLibrary, moveCardToZone, } from '../services/gameService.js';
const router = Router();
router.post('/', async (req, res) => {
    try {
        const { playerDeck } = req.body;
        const game = await createGame(playerDeck);
        res.json(game);
    }
    catch (error) {
        console.error('Create game error:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});
router.get('/:id', (req, res) => {
    try {
        const game = getGameState(req.params.id);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.json(game);
    }
    catch (error) {
        console.error('Get game error:', error);
        res.status(500).json({ error: 'Failed to get game' });
    }
});
router.post('/:id/action', (req, res) => {
    try {
        const { type, cardId, playerId, fromZone, toZone } = req.body;
        const gameId = req.params.id;
        let game;
        if (type === 'PlayCard') {
            game = playCard(gameId, cardId);
        }
        else if (type === 'Draw') {
            game = drawCard(gameId, playerId || 'player_1');
        }
        else if (type === 'Shuffle') {
            game = shuffleLibrary(gameId, playerId || 'player_1');
        }
        else if (type === 'MoveCard') {
            game = moveCardToZone(gameId, cardId, fromZone, toZone, playerId || 'player_1');
        }
        else if (type === 'EndTurn') {
            game = endTurn(gameId);
        }
        else {
            game = getGameState(gameId);
        }
        if (!game) {
            return res.status(404).json({ error: 'Action failed' });
        }
        res.json(game);
    }
    catch (error) {
        console.error('Game action error:', error);
        res.status(500).json({ error: 'Failed to execute action' });
    }
});
export default router;
//# sourceMappingURL=gameRoutes.js.map