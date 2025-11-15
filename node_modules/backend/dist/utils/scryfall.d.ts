interface ScryfallCard {
    id: string;
    name: string;
    mana_cost: string;
    type_line: string;
    power?: string;
    toughness?: string;
    oracle_text: string;
    image_uris?: {
        normal: string;
        large: string;
    };
    card_faces?: Array<{
        image_uris?: {
            normal: string;
        };
    }>;
}
export declare function fetchCardData(cardName: string): Promise<ScryfallCard | null>;
export declare function getCardImageUrl(card: ScryfallCard): string;
export declare function parseManaCost(manaCost: string): number;
export {};
//# sourceMappingURL=scryfall.d.ts.map