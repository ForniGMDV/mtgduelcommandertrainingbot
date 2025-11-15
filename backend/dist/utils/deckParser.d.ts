export interface DeckCard {
    name: string;
    quantity: number;
    isCommander?: boolean;
}
export interface ParsedDeck {
    commander: DeckCard | null;
    mainboard: DeckCard[];
}
export declare function parseDeck(deckText: string): ParsedDeck;
export declare function expandDeck(parsed: ParsedDeck): string[];
//# sourceMappingURL=deckParser.d.ts.map