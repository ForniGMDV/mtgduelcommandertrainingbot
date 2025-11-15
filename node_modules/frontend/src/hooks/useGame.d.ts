export interface CardData {
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
    hand: CardData[];
    battlefield: CardData[];
    graveyard: CardData[];
    library: CardData[];
    commander?: CardData;
}
export interface GameState {
    id: string;
    player: PlayerState;
    opponent: PlayerState;
    currentPhase: string;
    isPlayerTurn: boolean;
    turn: number;
    stack: CardData[];
}
export declare function useGame(): {
    gameState: GameState | null;
    loading: boolean;
    startGame: () => Promise<void>;
    playCard: (cardId: string) => Promise<void>;
    endTurn: () => Promise<void>;
};
//# sourceMappingURL=useGame.d.ts.map