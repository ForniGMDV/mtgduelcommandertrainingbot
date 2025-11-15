export function parseDeck(deckText) {
    const lines = deckText.split('\n').filter(line => line.trim());
    const mainboard = [];
    let commander = null;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//'))
            continue;
        const match = trimmed.match(/^(\d+)\s+(.+)$/);
        if (!match)
            continue;
        const quantity = parseInt(match[1], 10);
        const cardName = match[2].trim();
        if (quantity > 0) {
            mainboard.push({
                name: cardName,
                quantity,
                isCommander: false,
            });
        }
    }
    if (mainboard.length > 0) {
        const lastCard = mainboard[mainboard.length - 1];
        commander = { ...lastCard, isCommander: true };
        mainboard.pop();
    }
    return { commander, mainboard };
}
export function expandDeck(parsed) {
    const cards = [];
    // Add commander
    if (parsed.commander) {
        for (let i = 0; i < parsed.commander.quantity; i++) {
            cards.push(parsed.commander.name);
        }
    }
    // Add mainboard cards
    for (const card of parsed.mainboard) {
        for (let i = 0; i < card.quantity; i++) {
            cards.push(card.name);
        }
    }
    return cards;
}
//# sourceMappingURL=deckParser.js.map