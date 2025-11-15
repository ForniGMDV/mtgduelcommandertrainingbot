const cardCache = new Map();
let lastFetchTime = 0;
const FETCH_DELAY = 100;
export async function fetchCardData(cardName) {
    if (cardCache.has(cardName)) {
        return cardCache.get(cardName) || null;
    }
    try {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime;
        if (timeSinceLastFetch < FETCH_DELAY) {
            await new Promise(resolve => setTimeout(resolve, FETCH_DELAY - timeSinceLastFetch));
        }
        lastFetchTime = Date.now();
        const cleanName = cardName.trim();
        const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cleanName)}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MTGDuel/1.0'
            }
        });
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Card not found on Scryfall: ${cardName}`);
                cardCache.set(cardName, null);
                return null;
            }
            if (response.status === 429) {
                console.warn(`Scryfall rate limited, retrying in 2s: ${cardName}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return fetchCardData(cardName);
            }
            console.warn(`Scryfall error ${response.status}: ${cardName}`);
            cardCache.set(cardName, null);
            return null;
        }
        const data = (await response.json());
        console.log(`Found card: ${data.name} (searched as: ${cardName})`);
        cardCache.set(cardName, data);
        return data;
    }
    catch (error) {
        console.warn(`Error fetching card ${cardName}:`, error);
        cardCache.set(cardName, null);
        return null;
    }
}
export function getCardImageUrl(card) {
    if (card.image_uris?.normal) {
        return card.image_uris.normal;
    }
    if (card.card_faces?.[0]?.image_uris?.normal) {
        return card.card_faces[0].image_uris.normal;
    }
    return 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&size=normal';
}
export function parseManaCost(manaCost) {
    if (!manaCost)
        return 0;
    // Remove curly braces and count generic mana
    const generic = manaCost.match(/\{(\d+)\}/)?.[1] || '0';
    return parseInt(generic, 10);
}
//# sourceMappingURL=scryfall.js.map