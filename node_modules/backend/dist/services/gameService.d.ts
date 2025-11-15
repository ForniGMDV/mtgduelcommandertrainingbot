export interface Card {
    id: string;
    name: string;
    manaCost: number;
    type: string;
    power?: number;
    toughness?: number;
    text: string;
    imageUrl?: string;
}
export interface PlayerState {
    id: string;
    name: string;
    life: number;
    hand: Card[];
    battlefield: Card[];
    graveyard: Card[];
    exile: Card[];
    library: Card[];
    commander: Card | null;
    mana: number;
    maxMana: number;
}
export interface GameState {
    id: string;
    player: PlayerState;
    opponent: PlayerState;
    currentPhase: string;
    isPlayerTurn: boolean;
    turn: number;
    stack: Card[];
}
export declare function createGame(playerDeck?: Card[], opponentDeck?: Card[]): Promise<GameState>;
export declare function getGameState(gameId: string): GameState | undefined;
export declare function playCard(gameId: string, cardId: string): GameState | null;
export declare function drawCard(gameId: string, playerId: string): GameState | null;
export declare function shuffleLibrary(gameId: string, playerId: string): GameState | null;
export declare function moveCardToZone(gameId: string, cardId: string, fromZone: 'hand' | 'battlefield' | 'library' | 'graveyard' | 'exile', toZone: 'hand' | 'battlefield' | 'library' | 'graveyard' | 'exile', playerId: string): GameState | null;
export declare function endTurn(gameId: string): GameState | null;
//# sourceMappingURL=gameService.d.ts.map