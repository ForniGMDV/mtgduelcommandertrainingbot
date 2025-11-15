import { getRandomCards, SLIMEFOOT_DECK_LIST } from '../data/cards.js';
import { fetchCardData, getCardImageUrl } from '../utils/scryfall.js';
const GAME_STATES = new Map();
async function buildCard(name, id) {
    const scryfallCard = await fetchCardData(name);
    if (scryfallCard) {
        return {
            id,
            name: scryfallCard.name,
            manaCost: parseInt(scryfallCard.mana_cost?.match(/\{(\d+)\}/)?.[1] || '0', 10),
            type: scryfallCard.type_line || 'Unknown',
            power: scryfallCard.power ? parseInt(scryfallCard.power, 10) : undefined,
            toughness: scryfallCard.toughness ? parseInt(scryfallCard.toughness, 10) : undefined,
            text: scryfallCard.oracle_text || '',
            imageUrl: getCardImageUrl(scryfallCard),
        };
    }
    const guessedCost = name.toLowerCase().includes('land') ? 0 :
        name.toLowerCase().includes('mana') ? 0 : 1;
    return {
        id,
        name,
        manaCost: guessedCost,
        type: 'Card',
        text: '',
        imageUrl: undefined,
    };
}
function initializeDeck(deckCards) {
    if (!deckCards || deckCards.length === 0) {
        return { commander: null, hand: [], library: [] };
    }
    const cards = [...deckCards];
    // Last card is the commander
    const commander = cards.length >= 99 ? cards.pop() || null : null;
    // First 7 cards go to hand, rest to library
    const hand = cards.splice(0, 7);
    const library = cards;
    return { commander, hand, library };
}
export async function createGame(playerDeck, opponentDeck) {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pDeck = playerDeck && playerDeck.length > 0 ? playerDeck : getRandomCards(100);
    const oDeck = await Promise.all(SLIMEFOOT_DECK_LIST.map((name, idx) => buildCard(name, `bot_card_${idx}`)));
    const playerSetup = initializeDeck(pDeck);
    const opponentSetup = initializeDeck(oDeck);
    const opponentBattlefield = [];
    const opponentHand = [...opponentSetup.hand];
    // Add some initial creatures and lands to opponent battlefield for testing
    for (let i = 0; i < opponentHand.length; i++) {
        const card = opponentHand[i];
        if (opponentBattlefield.length < 3 && (card.type.includes('Creature') || card.type.includes('Land'))) {
            opponentBattlefield.push(card);
            opponentHand.splice(i, 1);
            i--;
        }
    }
    const gameState = {
        id: gameId,
        player: {
            id: 'player_1',
            name: 'You',
            life: 40,
            hand: playerSetup.hand,
            battlefield: [],
            graveyard: [],
            exile: [],
            library: playerSetup.library,
            commander: playerSetup.commander,
            mana: 0,
            maxMana: 1,
        },
        opponent: {
            id: 'opponent_1',
            name: 'AI Bot',
            life: 40,
            hand: opponentHand,
            battlefield: opponentBattlefield,
            graveyard: [],
            exile: [],
            library: opponentSetup.library,
            commander: opponentSetup.commander,
            mana: 0,
            maxMana: 1,
        },
        currentPhase: 'Main Phase',
        isPlayerTurn: true,
        turn: 1,
        stack: [],
    };
    GAME_STATES.set(gameId, gameState);
    return gameState;
}
export function getGameState(gameId) {
    return GAME_STATES.get(gameId);
}
export function playCard(gameId, cardId) {
    const game = GAME_STATES.get(gameId);
    if (!game)
        return null;
    const cardIndex = game.player.hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1)
        return null;
    const card = game.player.hand[cardIndex];
    game.player.hand.splice(cardIndex, 1);
    game.player.battlefield.push(card);
    GAME_STATES.set(gameId, game);
    return game;
}
export function drawCard(gameId, playerId) {
    const game = GAME_STATES.get(gameId);
    if (!game)
        return null;
    const player = playerId === 'player_1' ? game.player : game.opponent;
    if (player.library.length === 0)
        return game;
    const card = player.library.shift();
    if (card) {
        player.hand.push(card);
    }
    GAME_STATES.set(gameId, game);
    return game;
}
export function shuffleLibrary(gameId, playerId) {
    const game = GAME_STATES.get(gameId);
    if (!game)
        return null;
    const player = playerId === 'player_1' ? game.player : game.opponent;
    for (let i = player.library.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [player.library[i], player.library[j]] = [player.library[j], player.library[i]];
    }
    GAME_STATES.set(gameId, game);
    return game;
}
export function moveCardToZone(gameId, cardId, fromZone, toZone, playerId) {
    const game = GAME_STATES.get(gameId);
    if (!game)
        return null;
    const player = playerId === 'player_1' ? game.player : game.opponent;
    const fromArray = player[fromZone];
    const toArray = player[toZone];
    const cardIndex = fromArray.findIndex((c) => c.id === cardId);
    if (cardIndex === -1)
        return null;
    const card = fromArray[cardIndex];
    fromArray.splice(cardIndex, 1);
    toArray.push(card);
    GAME_STATES.set(gameId, game);
    return game;
}
function botPlayCards(gameId) {
    const game = GAME_STATES.get(gameId);
    if (!game)
        return;
    const bot = game.opponent;
    let played = true;
    while (played && bot.hand.length > 0) {
        played = false;
        const cardIndex = bot.hand.findIndex(card => card.manaCost <= bot.mana);
        if (cardIndex !== -1) {
            const card = bot.hand[cardIndex];
            bot.hand.splice(cardIndex, 1);
            bot.battlefield.push(card);
            bot.mana -= card.manaCost;
            played = true;
        }
    }
    GAME_STATES.set(gameId, game);
}
function botTakeTurn(gameId) {
    const game = GAME_STATES.get(gameId);
    if (!game)
        return;
    const bot = game.opponent;
    bot.maxMana = Math.min(bot.maxMana + 1, 10);
    bot.mana = bot.maxMana;
    drawCard(gameId, 'opponent_1');
    botPlayCards(gameId);
    const updatedGame = GAME_STATES.get(gameId);
    if (updatedGame) {
        updatedGame.isPlayerTurn = true;
        updatedGame.currentPhase = 'Main Phase';
        updatedGame.turn++;
        bot.mana = 0;
        bot.maxMana = Math.min(bot.maxMana, 10);
        drawCard(gameId, 'player_1');
        GAME_STATES.set(gameId, updatedGame);
    }
}
export function endTurn(gameId) {
    const game = GAME_STATES.get(gameId);
    if (!game)
        return null;
    game.isPlayerTurn = false;
    game.currentPhase = 'Opponent Phase';
    const player = game.player;
    player.mana = 0;
    player.maxMana = Math.min(player.maxMana + 1, 10);
    setTimeout(() => {
        botTakeTurn(gameId);
    }, 2000);
    GAME_STATES.set(gameId, game);
    return game;
}
//# sourceMappingURL=gameService.js.map