export interface DeckCard {
  name: string
  quantity: number
  isCommander?: boolean
}

export interface ParsedDeck {
  commander: DeckCard | null
  mainboard: DeckCard[]
}

export function parseDeck(deckText: string): ParsedDeck {
  const lines = deckText.split('\n').filter(line => line.trim())
  const mainboard: DeckCard[] = []
  let commander: DeckCard | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) continue

    const match = trimmed.match(/^(\d+)\s+(.+)$/)
    if (!match) continue

    const quantity = parseInt(match[1], 10)
    const cardName = match[2].trim()

    if (quantity > 0) {
      mainboard.push({
        name: cardName,
        quantity,
        isCommander: false,
      })
    }
  }

  if (mainboard.length > 0) {
    const lastCard = mainboard[mainboard.length - 1]
    commander = { ...lastCard, isCommander: true }
    mainboard.pop()
  }

  return { commander, mainboard }
}

export function expandDeck(parsed: ParsedDeck): string[] {
  const cards: string[] = []

  // Add commander
  if (parsed.commander) {
    for (let i = 0; i < parsed.commander.quantity; i++) {
      cards.push(parsed.commander.name)
    }
  }

  // Add mainboard cards
  for (const card of parsed.mainboard) {
    for (let i = 0; i < card.quantity; i++) {
      cards.push(card.name)
    }
  }

  return cards
}
